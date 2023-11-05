/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vitest/globals" />

import { resolve } from 'node:path'
import { ViteDevServer, createServer } from 'vite'
import pluginMarkedMpa from '../src/index.js'

type Plugin = Record<string, any>

let server: ViteDevServer

vi.mock('vite', async () => {
  const actual = (await vi.importActual('vite')) as any

  return { ...actual, createLogger: vi.fn().mockReturnValue({ info: vi.fn() }) }
})

beforeEach(async () => {
  server = server = await createServer()
  vi.clearAllMocks()
})

it('should create a Vite plugin', () => {
  const plugin = pluginMarkedMpa()
  expect(plugin).toHaveProperty('name', 'vite:plugin-marked-mpa')
})

it('should handle custom options', () => {
  const plugin: Plugin = pluginMarkedMpa({
    root: 'custom-root',
    pages: 'custom-pages',
    data: ['custom-data/**/*.{js,yml.json}'],
    enableDataStats: true
  })

  expect(plugin.name).toBe('vite:plugin-marked-mpa')
  expect(plugin.config).toBeInstanceOf(Function)

  const config = plugin.config.call(null, {})
  expect(config).toHaveProperty('appType', 'custom')
  expect(config).toHaveProperty('build')
  expect(config).toHaveProperty('optimizeDeps')

  expect(config.build).toHaveProperty('rollupOptions')
  expect(config.build.rollupOptions).toHaveProperty('input')
})

it('should handle file resolution, load and transform content', async () => {
  const plugin: Plugin = pluginMarkedMpa({
    root: 'test/fixtures',
    layouts: {
      dir: '_layouts'
    },
    data: {
      foo: Promise.resolve('bar')
    },
    frontmatter: {
      dataPrefix: 'page'
    },
    enableDataStats: true
  })

  plugin.config()
  plugin.configResolved({ mode: 'production' })

  const source = 'index.html'
  const id = plugin.resolveId(source)
  const content = await plugin.load(id)
  const transformedContent = await plugin.transformIndexHtml.handler(content, {
    server
  })

  expect(id).toEqual(source)
  expect(content).toMatchInlineSnapshot(`
    "---
    title: Hello, world!
    author: John Doe
    ---

    # {{= page.title }}

    This is the main content of your Markdown file autored by **{{= page.author }}**.

    ## foo

    foo

    ### bar

    > bar

    ### baz

    - baz
    "
  `)
  expect(transformedContent).toMatchInlineSnapshot(`
    "<!DOCTYPE html>
    <html lang=\\"en\\">
    <head>
      <meta charset=\\"UTF-8\\">
      <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\">
      <title></title>
    </head>
    <body>
      <h1 id=\\"hello-world\\" tabindex='-1'>Hello, world!</h1>
    <p>This is the main content of your Markdown file autored by <strong>John Doe</strong>.</p>
    <h2 id=\\"foo\\" tabindex='-1'>foo</h2>
    <p>foo</p>
    <h3 id=\\"bar\\" tabindex='-1'>bar</h3>
    <blockquote>
    <p>bar</p>
    </blockquote>
    <h3 id=\\"baz\\" tabindex='-1'>baz</h3>
    <ul>
    <li>baz</li>
    </ul>

    </body>
    </html>"
  `)
})

it('should handle file resolution and load content for non-existent files', async () => {
  const plugin = pluginMarkedMpa({
    root: 'test/fixtures',
    data: false as any
  })
  const { resolveId, load }: Plugin = plugin

  const file = 'missing.html'
  const resolvedId = resolveId.call(null, file)
  const loadedContent = await load.call(null, resolvedId)

  expect(resolvedId).toBeUndefined()
  expect(loadedContent).toBeUndefined()
})

it('should handle hot updates', async () => {
  const plugin = pluginMarkedMpa({
    root: 'test/fixtures'
  })
  const { handleHotUpdate }: Plugin = plugin

  const files = [
    'pages/foo.md',
    '_layouts/foo.html',
    '_partials/foo.html',
    '_data/foo.json'
  ]

  const server = { config: { root: 'test' }, ws: { send: vi.fn() } }
  files.forEach(async f => {
    const file = resolve('test/fixtures', f)
    const hotUpdateResult = await handleHotUpdate({ file, server })

    expect(hotUpdateResult).toBeUndefined()
    // verify that the WebSocket send method was called
    expect(server.ws.send).toHaveBeenCalledWith({
      type: 'full-reload',
      path: '*'
    })
  })
})

it('should serve transformed HTML for documents', async () => {
  const { configureServer }: Plugin = pluginMarkedMpa({
    root: 'test/fixtures'
  })

  vi.spyOn(server, 'transformIndexHtml').mockResolvedValueOnce('fired!')

  const serverMiddleware = await configureServer(server)
  await serverMiddleware()
  const handle = server.middlewares.stack.pop()?.handle as unknown as (
    req: any,
    res: any
  ) => Promise<void>

  const res = { end: vi.fn(), statusCode: 200 }
  // Mock a request for an HTML document
  const req = {
    headers: { 'sec-fetch-dest': 'document' },
    url: '/'
  }

  await handle(req, res)
  expect(res.end).not.toHaveBeenCalledWith('')
  expect(res.statusCode).toBe(200)

  await handle({ ...req, url: '/foo/bar' }, res)
  expect(res.end).not.toHaveBeenCalledWith('')
  expect(res.statusCode).toBe(200)

  await handle({ ...req, url: '/missing.html' }, res)
  expect(res.end).not.toHaveBeenCalledWith('')
  expect(res.statusCode).toBe(404)

  await handle(null, res)
  expect(res.end).not.toHaveBeenCalledWith('')
  expect(res.statusCode).toBe(500)

  await server.close()
})
