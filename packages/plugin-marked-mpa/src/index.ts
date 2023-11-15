import { readFile, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { Eta } from 'eta'
import fg from 'fast-glob'
import { type Plugin, type ResolvedConfig, createLogger } from 'vite'
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
    ignore = ['**/_**/*.*', '**/_*.md'],
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

  // template engine
  const eta = new Eta({
    views: resolve(root, partials),
    useWith: true,
    varName: 'data',
    autoTrim: false,
    ...etaOptions
  })

  let viteConfig: ResolvedConfig

  return {
    name: 'vite:plugin-marked-mpa',
    config() {
      return {
        appType: 'custom',
        build: { rollupOptions: { input } },
        optimizeDeps: { include: [] }
      }
    },
    configResolved(config) {
      viteConfig = config
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

        return await readFile(source, 'utf8')
      }
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(md: string, { server, path }) {
        const route = server ? routes[path] : inputMap[path.slice(1)]
        const ctx = {
          NODE_ENV: viteConfig.mode,
          isDev: viteConfig.mode === 'development',
          routes: inputMap,
          route
        } as Context

        if (enableDataStats) {
          ctx.stats = await stat(join(resolvedPagesDir, route.source))
        }

        const marked = createProcessor(ctx, {
          root,
          layouts,
          eta,
          ...processorOptions
        })

        const content = frontmatter(ctx, md, fmOptions)
        // now we should have matter data in the ctx
        await retrieveData(ctx, normalizedDatasource, !disableDataMerge)

        // special prop (useWith)
        if (typeof ctx.useWith === 'object' && !Array.isArray(ctx.useWith)) {
          for (const key in ctx.useWith) {
            const path = String(ctx.useWith[key])
            const _md = await readFile(
              join(resolvedPagesDir, dirname(ctx.route.source), path),
              'utf8'
            )
            const tabCtx = { ...ctx }
            const _content = frontmatter(tabCtx, _md, fmOptions).replace(
              /\\</g,
              '&lt;'
            )

            ctx.useWith[key] = {
              md: await eta.renderStringAsync(_content, tabCtx),
              html: await marked.parse(_content, {
                ...marked.defaults,
                hooks: {
                  preprocess: async md =>
                    await eta.renderStringAsync(md, tabCtx),
                  postprocess: html => html
                }
              })
            }
          }
        }

        const html = await marked.parse(content)

        /* c8 ignore next 5 */
        if ('datasources' in ctx && Array.isArray(ctx.datasources)) {
          datasources.push(...ctx.datasources.map(d => resolve(d)))
          // adds datasources to watcher
          server && server.watcher.add(datasources)
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
              const { source } = routes[url] || {}
              const id = join(resolvedPagesDir, source ? source : '404.md')

              const md = await readFile(id, 'utf8')
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
