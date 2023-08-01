import pluginFormat from '../src/index.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Plugin = Record<string, any>

describe('pluginFormat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('formats assets except .html files', async () => {
    const options = { tabWidth: 4 }
    const id = 'index.css'
    const source = 'body { color: red; }'

    const plugin: Plugin = pluginFormat(options)
    const bundle = {
      [id]: { type: 'asset', source }
    }

    await plugin.generateBundle({}, bundle)

    expect(bundle[id].source).toMatchSnapshot()
  })

  it('formats chunks when minify is disabled', async () => {
    const options = { semi: true }
    const id = 'index.js'
    const code = 'function foo() { console.log("Hello") }'

    const plugin: Plugin = pluginFormat(options)
    const bundle = {
      [id]: { type: 'chunk', code }
    }

    await plugin.generateBundle({}, bundle)

    expect(bundle[id].code).toMatchSnapshot()
  })

  it('does not format chunks when minify is enabled', async () => {
    const options = { semi: true }
    const id = 'index.js'
    const code = 'function foo() { console.log("Hello"); }'

    const plugin: Plugin = pluginFormat(options)
    const bundle = {
      [id]: { type: 'chunk', code }
    }

    // Set minify to true
    const buildOptions = {
      minify: true,
      sourcemap: false
    }

    await plugin.configResolved({ build: buildOptions })
    await plugin.generateBundle({}, bundle)

    expect(bundle[id].code).toBe(code)
  })

  it('formats index HTML using transformIndexHtml hook', async () => {
    const options = { vueIndentScriptAndStyle: true }
    const html = '<div>\n<span>Hello, Vite!</span></div>'

    const plugin: Plugin = pluginFormat(options)

    await plugin.generateBundle(
      {},
      { 'index.html': { type: 'asset', source: html } }
    )
    const transformedHtml = await plugin.transformIndexHtml(html, {
      path: 'index.html'
    })

    expect(transformedHtml).toMatchSnapshot()
  })

  test('continues the loop when id property is not present in bundle object', async () => {
    const plugin: Plugin = pluginFormat()

    expect(
      plugin.generateBundle({}, { '/index.html': { type: 'asset' } })
    ).resolves.not.toThrow()
  })

  test('continues the loop when hasSourcemap is true', async () => {
    const plugin: Plugin = pluginFormat()
    plugin.configResolved({ build: { minify: true } })

    expect(
      plugin.generateBundle({}, { '/index.html': { type: 'asset' } })
    ).resolves.not.toThrow()
  })
})
