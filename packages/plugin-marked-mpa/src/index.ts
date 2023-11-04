import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import fg from 'fast-glob'
import { createLogger, type Plugin } from 'vite'
import { createProcessor } from './processor.js'
import { createRoutes } from './routes.js'
import type { Context, PluginMarkedMpaOptions } from './types.js'

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
    layouts = {},
    enableDataStats,
    ...processorOptions
  } = options
  const { dir: layoutdir = 'layouts', ...restLayouts } = layouts
  const layoutsOptions: typeof layouts = {
    dir: resolve(root, layoutdir),
    name: 'default',
    placeholder: /<Outlet[ \t]*?\/>/,
    ...restLayouts
  }

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

  const ctx = { routes: routesByIds, layouts: layoutsOptions } as Context
  const marked = createProcessor(ctx, {
    root,
    layouts: layoutsOptions,
    ...processorOptions
  })

  const input = Object.keys(routesByIds)

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
    },
    resolveId(id) {
      if (input.includes(id)) {
        return id
      }
    },
    async load(id) {
      if (input.includes(id)) {
        ctx.route = routesByIds[id]

        return await readFile(ctx.route.source, 'utf8')
      }
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(md: string) {
        if (enableDataStats && ctx.route.source) {
          addData('stats', await stat(String(ctx.route.source)))
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
              ctx.route = routes[url]

              const source = resolve(
                cwd,
                ctx.route ? ctx.route.source : '404.md'
              )
              const md = ctx.route ? await readFile(source, 'utf8') : '404'
              const html = await server.transformIndexHtml(url, md)

              res.statusCode = ctx.route ? 200 : 404
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
    if (typeof ctx[key] === 'object') {
      Object.assign(ctx[key] as object, data)
    } else {
      ctx[key] = data
    }
  }
}

export type * from './types.js'
