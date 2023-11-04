import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import fg from 'fast-glob'
import { createLogger, type Plugin } from 'vite'
import { createProcessor } from './processor.js'
import { createRoutes } from './routes.js'
import type { PluginMarkedMpaOptions, UnknownData } from './types.js'

const log = createLogger()

/**
 * A Vite plugin for rendering Markdown files to HTML for Multi-Page
 * Applications.
 */
export default function pluginMarkedMpa(
  options: PluginMarkedMpaOptions = {}
): Plugin {
  const {
    root = 'views',
    pages = 'pages',
    enableDataStats,
    ...processorOptions
  } = options

  const cwd = resolve(root, pages)
  const sources = fg.sync(`**/*.md`, { cwd })

  const routes = createRoutes(sources, cwd)
  const routesValues = Object.values(routes)

  const routesByIds = routesValues.reduce(
    (acc, curr) => {
      acc[curr.id] = curr
      return acc
    },
    {} as typeof routes
  )
  const inputPages = routesValues
    .filter(({ isAlias }) => !isAlias)
    .map(({ id }) => id)

  const ctx: { data: UnknownData } = { data: {} }
  const marked = createProcessor.call(ctx, { root, ...processorOptions })

  return {
    name: 'vite:plugin-marked-mpa',
    config() {
      return {
        appType: 'custom',
        build: { rollupOptions: { input: inputPages } },
        optimizeDeps: { include: [] }
      }
    },
    configResolved({ mode }) {
      ctx.data.NODE_ENV = mode
      ctx.data.isDev = mode === 'development'
    },
    resolveId(id) {
      if (inputPages.includes(id)) {
        return id
      }
    },
    async load(id) {
      if (inputPages.includes(id)) {
        const route = routesByIds[id]

        // reset context
        ctx.data = route

        return await readFile(route.source, 'utf8')
      }
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(md: string) {
        if (enableDataStats && ctx.data.source) {
          addData('stats', await stat(String(ctx.data.source)))
        }

        return await marked.parse(md)
      }
    },
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res) => {
          try {
            if (req.headers['sec-fetch-dest'] === 'document') {
              const url = req.url?.replace(/(\.html|\/)$/, '') || '/'
              const route = routes[url]
              const source = resolve(cwd, route ? route.source : '404.md')

              // reset context
              ctx.data = route

              const md = route ? await readFile(source, 'utf8') : '404'
              const html = await server.transformIndexHtml(url, md)

              res.statusCode = route ? 200 : 404
              res.end(html)
            }
          } catch (err) {
            res.statusCode = 500
            res.end((err as Error).stack)
          }
        })
      }
    },
    async handleHotUpdate({ file, server }) {
      if (file.endsWith('.md')) {
        const source = file.replace(server.config.root, '')

        log.info(`\x1b[32mpage reload\x1b[0m ${source.slice(1)}`, {
          timestamp: true
        })

        server.ws.send({ type: 'full-reload', path: '*' })
      }
    }
  }

  function addData(key: string, data: unknown) {
    /* c8 ignore next 3 */
    if (typeof ctx.data[key] === 'object') {
      Object.assign(ctx.data[key] as UnknownData, data)
    } else {
      ctx.data[key] = data
    }
  }
}

export type * from './types.js'
