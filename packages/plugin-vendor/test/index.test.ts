/// <reference types="vitest/globals" />
import { join } from 'node:path/posix'
import pluginVendor from '../src/index.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const mockConfig = {
    root: '/path/to/root',
    publicDir: '/path/to/root/public'
  }
  const { promises: fsp } = (await import('node:fs')) as unknown as {
    promises: Record<string, Mock>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    plugin = pluginVendor({ applyOnMode: ['static', 'development'] })
  })

  it('applies the plugin on specified modes', () => {
    expect(plugin.apply({ mode: 'static' })).toBe(true)
    expect(plugin.apply({ mode: 'development' })).toBe(true)
    expect(plugin.apply({ mode: 'production' })).toBe(false)
  })

  it('configResolved function correctly sets resolvedRoot and resolvedPublicDir', async () => {
    plugin = pluginVendor({ applyOnMode: true })

    expect(plugin.apply({ mode: true })).toBe(true)
    expect(await plugin.configResolved(mockConfig)).toBeUndefined()
  })

  it('buildStart function copies vendor files to the destination directory', async () => {
    await plugin.configResolved(mockConfig)
    await plugin.buildStart()

    expect(fsp.cp).toHaveBeenCalledTimes(2)
    expect(fsp.cp).toHaveBeenCalledWith(
      join(mockConfig.root, 'node_modules/foo/dist/index.js'),
      join(mockConfig.publicDir, 'vendors/foo/dist/index.js'),
      {
        preserveTimestamps: true,
        recursive: true
      }
    )
    expect(fsp.cp).toHaveBeenCalledWith(
      join(mockConfig.root, 'node_modules/bar/dist/index.js'),
      join(mockConfig.publicDir, 'vendors/bar/dist/index.js'),
      {
        preserveTimestamps: true,
        recursive: true
      }
    )
  })

  it('copies files excluding those specified in ignore array', async () => {
    const plugin: Plugin = pluginVendor({
      ignore: ['foo'],
      manualEntry: {
        baz: { files: 'dist/**/*' }
      }
    })

    plugin.configResolved(mockConfig)
    await plugin.buildStart()

    // One from entries and one from manual entry, excluding pkg2 and pkg3
    expect(fsp.cp).toHaveBeenCalledTimes(2)
    expect(fsp.cp).toHaveBeenCalledWith(
      join(mockConfig.root, 'node_modules/bar/dist/index.js'),
      join(mockConfig.publicDir, 'vendors/bar/dist/index.js'),
      {
        preserveTimestamps: true,
        recursive: true
      }
    )
    expect(fsp.cp).toHaveBeenCalledWith(
      join(mockConfig.root, 'node_modules/baz/dist/index.js'),
      join(mockConfig.publicDir, 'vendors/baz/dist/index.js'),
      {
        preserveTimestamps: true,
        recursive: true
      }
    )
  })

  it('configResolved function removes the destination directory', async () => {
    await plugin.configResolved(mockConfig)

    expect(fsp.rm).toHaveBeenCalledTimes(1)
    expect(fsp.rm).toHaveBeenCalledWith(join(mockConfig.publicDir, 'vendors'), {
      recursive: true,
      force: true
    })
  })

  it('throws on fsp.cp error', async () => {
    // Mocking fsp.cp to throw an error
    fsp.cp.mockRejectedValueOnce(new Error('Error during copy'))

    try {
      await plugin.configResolved(mockConfig)
      await plugin.buildStart()
    } catch (error: unknown) {
      expect((error as Error).message).toBe('Error during copy')
    }
  })
})
