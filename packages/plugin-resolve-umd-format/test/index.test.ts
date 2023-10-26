import umdFormatResolver from '../src/index.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Plugin = Record<string, any>

describe('umdFormatResolver', () => {
  let plugin: Plugin

  beforeAll(() => {
    plugin = umdFormatResolver()
  })

  it('should replace .cjs with .js in chunk filenames', () => {
    const bundle = {
      'my-chunk.umd.cjs': {
        type: 'chunk',
        fileName: 'my-chunk.umd.cjs'
      }
    }

    plugin.generateBundle({}, bundle)

    expect(bundle['my-chunk.umd.cjs'].fileName).toBe('my-chunk.umd.js')
  })

  it('should not modify filenames that do not end with .umd.cjs', () => {
    const bundle = {
      'another-chunk.cjs': {
        type: 'chunk',
        fileName: 'another-chunk.cjs'
      }
    }

    plugin.generateBundle({}, bundle)

    expect(bundle['another-chunk.cjs'].fileName).toBe('another-chunk.cjs')
  })

  it('should not modify non-chunk items in the bundle', () => {
    const bundle = {
      'index.html': {
        type: 'asset',
        fileName: 'index.html'
      }
    }

    plugin.generateBundle({}, bundle)

    expect(bundle['index.html'].fileName).toBe('index.html')
  })
})
