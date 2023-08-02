/* eslint-disable @typescript-eslint/no-explicit-any */
import pluginVendor from '../src/index.js'

type Plugin = Record<string, any>
type Mock = ReturnType<typeof vi.fn>

vi.mock('node:fs', await import('./mocks.js').then(({ mockFs }) => mockFs))
vi.mock(
  'node:path',
  await import('./mocks.js').then(({ mockPath }) => mockPath)
)
vi.mock(
  'fast-glob',
  await import('./mocks.js').then(({ mockFastGlob }) => mockFastGlob)
)

describe('pluginVendor', async () => {
  let plugin: Plugin
  let plugin2: Plugin
  const root = '/path/to/root'
  const publicDir = '/path/to/root/public'
  const vendorDir = `${publicDir}/vendors`
  const { promises: fsp } = (await import('node:fs')) as unknown as {
    promises: Record<string, Mock>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    plugin = pluginVendor({ applyOnMode: ['static', 'development'] })[0]
    plugin2 = pluginVendor()[1]
  })

  it('applies the plugin on specified modes', () => {
    expect(plugin.apply({}, { mode: 'static' })).toBe(true)
    expect(plugin.apply({}, { mode: 'development' })).toBe(true)
    expect(plugin.apply({}, { mode: 'production' })).toBe(false)
  })

  it('configResolved function correctly sets resolvedRoot and resolvedPublicDir', () => {
    plugin = pluginVendor({ applyOnMode: true })[0]

    expect(plugin.apply({}, { mode: true })).toBe(true)
    expect(plugin.configResolved({ publicDir, root })).toBeUndefined()
  })

  it('buildStart function copies vendor files to the destination directory', async () => {
    plugin.configResolved({ publicDir, root })
    await plugin.buildStart()

    expect(fsp.cp).toHaveBeenCalledTimes(2)
    expect(fsp.cp).toHaveBeenCalledWith(
      `${root}/node_modules/foo/index.js`,
      `${publicDir}/vendors/foo/index.js`,
      {
        preserveTimestamps: true,
        recursive: true
      }
    )
    expect(fsp.cp).toHaveBeenCalledWith(
      `${root}/node_modules/foo/index.js`,
      `${publicDir}/vendors/foo/index.js`,
      {
        preserveTimestamps: true,
        recursive: true
      }
    )
  })

  it('configResolved function removes the destination directory', async () => {
    await plugin2.configResolved({ publicDir })

    expect(fsp.rm).toHaveBeenCalledTimes(1)
    expect(fsp.rm).toHaveBeenCalledWith(vendorDir, {
      recursive: true,
      force: true
    })
  })

  it('throws on fsp.cp error', async () => {
    // Mocking fsp.cp to throw an error
    fsp.cp.mockRejectedValueOnce(new Error('Error during copy'))

    try {
      plugin.configResolved({ publicDir, root })
      await plugin.buildStart()
    } catch (error: any) {
      expect(error.message).toBe('Error during copy')
    }
  })
})
