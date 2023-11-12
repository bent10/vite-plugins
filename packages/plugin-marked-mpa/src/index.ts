import { readFile, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { Eta } from 'eta'
import fg from 'fast-glob'
import { createLogger, type Plugin } from 'vite'
import { retrieveData } from './data.js'
import { frontmatter } from './frontmatter.js'
import { createProcessor } from './processor.js'
import { createRoutes } from './routes.js'
import { normalizeDataSource } from './utils.js'
import type { Context, PluginMarkedMpaOptions, RouteMap } from './types.js'

const log = createLogger()

/**
 * A Vite plugin for rendering Markdown files to HTML for Multi-Page
 * Applications.
 */
export default function pluginMarkedMpa(
  options: PluginMarkedMpaOptions = {}
): Plugin {
  const {
    root = 'src',
    pages = 'pages',
    ignore = ['**/_*.md'],
    partials = '_partials',
    layouts = '_layouts',
    frontmatter: fmOptions,
    data: datasource = '_data',
    disableDataMerge,
    enableDataStats,
    eta: etaOptions,
    ...processorOptions
  } = options

  const resolvedPagesDir = resolve(root, pages)
  const resolvedPartialsDir = resolve(root, partials)
  const resolvedLayoutsDir = resolve(root, layouts)

  const normalizedDatasource = normalizeDataSource(datasource, root)
  // set datasources from ctx, later
  const datasources: string[] = []

  const sources = fg.sync(`**/*.md`, { cwd: resolvedPagesDir, ignore })
  const routes = createRoutes(sources)

  const inputMap = Object.values(routes).reduce(
    (acc, { source, stem, id, url }) => {
      acc[id] = { source, stem, id, url }
      return acc
    },
    {} as RouteMap
  )
  const input = Object.keys(inputMap)

  const ctx = { routes: {} } as Context

  // template engine
  const eta = new Eta({
    views: resolve(root, partials),
    useWith: true,
    varName: 'data',
    tags: ['{{', '}}'],
    autoTrim: false,
    ...etaOptions
  })
  const marked = createProcessor(ctx, {
    root,
    layouts,
    eta,
    ...processorOptions
  })

  return {
    name: 'vite:plugin-marked-mpa',
    config() {
      return {
        appType: 'custom',
        build: { rollupOptions: { input } },
        optimizeDeps: { include: [] }
      }
    },
    configResolved({ mode }) {
      ctx.NODE_ENV = mode
      ctx.isDev = mode === 'development'

      for (const id in inputMap) {
        ctx.routes[id] = inputMap[id]
      }
    },
    resolveId(id) {
      if (inputMap[id]) {
        return id
      }
    },
    async load(id) {
      if (inputMap[id]) {
        const route = inputMap[id]
        const source = resolve(resolvedPagesDir, route.source)

        if (enableDataStats) {
          ctx.stats = await stat(source)
        }

        ctx.route = route

        return await readFile(source, 'utf8')
      }
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(md: string, { server }) {
        const content = frontmatter(ctx, md, fmOptions)
        // now we should have matter data in the ctx
        await retrieveData(ctx, normalizedDatasource, !disableDataMerge)

        // special prop (useWith)
        if (typeof ctx.useWith === 'object' && !Array.isArray(ctx.useWith)) {
          for (const key in ctx.useWith) {
            const path = ctx.useWith[key]
            const _md = await readFile(
              resolve(root, pages, dirname(ctx.route.source), path),
              'utf8'
            )
            const tabCtx = { ...ctx }
            const _content = frontmatter(tabCtx, _md, fmOptions)

            const _html = await marked.parse(_content, {
              ...marked.defaults,
              hooks: {
                preprocess: async content =>
                  await eta.renderStringAsync(
                    content.replace(/\\{/g, '&#123;'),
                    tabCtx
                  ),
                postprocess: html => html
              }
            })

            ctx.useWith[key] = _html
          }
        }

        const html = await marked.parse(content)

        if ('datasources' in ctx && Array.isArray(ctx.datasources)) {
          datasources.push(...ctx.datasources.map(d => resolve(d)))
          // adds datasources to watcher
          server?.watcher.add(datasources)
        }

        return html
      }
    },
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res) => {
          try {
            if (req.headers['sec-fetch-dest'] === 'document') {
              const url = req.url?.replace(/(\.html|\/)$/, '') || '/'
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { isAlias: _, ...route } = routes[url] || {}
              ctx.route = route

              const source = resolve(
                resolvedPagesDir,
                route.source ? route.source : '404.md'
              )

              const md = await readFile(source, 'utf8')
              const html = await server.transformIndexHtml(url, md)

              res.statusCode = 200
              res.end(html)
            }
          } catch (err) {
            const error = err as Error

            res.statusCode = /^ENOENT: no such file or directory/.test(
              error.message
            )
              ? 404
              : 500
            res.end(error.stack)
          }
        })
      }
    },
    async handleHotUpdate({ file, server }) {
      if (
        file.startsWith(resolvedPagesDir) ||
        file.startsWith(resolvedLayoutsDir) ||
        file.startsWith(resolvedPartialsDir) ||
        datasources.includes(file)
      ) {
        const source = file.replace(server.config.root, '')

        log.info(`\x1b[32mpage reload\x1b[0m ${source.slice(1)}`, {
          timestamp: true
        })

        server.ws.send({ type: 'full-reload', path: '*' })
      }
    }
  }
}

export type * from './types.js'
