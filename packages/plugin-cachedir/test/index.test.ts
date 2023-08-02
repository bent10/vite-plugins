import { resolve } from 'node:path'
import pluginCacheDir from '../src/index.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Plugin = Record<string, any>

describe('pluginCacheDir', () => {
  it('resolves the default cache directory in Vite config', () => {
    const config = {
      cacheDir: resolve('node_modules/.vite'), // should be default vite cache dir
      root: resolve()
    }
    // Set process.env.INIT_CWD to mimic being in a monorepo
    process.env.INIT_CWD = '/path/to/monorepo/package1'

    const plugin: Plugin = pluginCacheDir()
    plugin.configResolved(config)

    expect(config.cacheDir).toBe(
      '/path/to/monorepo/package1/node_modules/.vite'
    )
  })

  it("does not resolve cache directory if it's already provided in Vite config", () => {
    const cacheDir = '/path/to/custom-cache-dir'
    const config = {
      cacheDir,
      root: '/path/to/root'
    }
    // Set process.env.INIT_CWD to mimic being in a monorepo
    process.env.INIT_CWD = '/path/to/monorepo/package2'

    const plugin: Plugin = pluginCacheDir()
    plugin.configResolved(config)

    expect(config.cacheDir).toBe(cacheDir)
  })

  it('resolves the default test cache directory in Vite config', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: any = {
      root: resolve()
    }
    // Set process.env.INIT_CWD to mimic being in a monorepo
    process.env.INIT_CWD = '/path/to/monorepo/package3'

    const plugin: Plugin = pluginCacheDir()
    plugin.configResolved(config)

    expect(config.test?.cache?.dir).toBe(
      '/path/to/monorepo/package3/node_modules/.vitest'
    )
  })

  it("does not resolve test cache directory if it's already provided in Vite config", () => {
    const dir = '/path/to/custom-test-cache-dir'
    const config = {
      test: { cache: { dir } },
      root: '/path/to/root'
    }
    // Set process.env.INIT_CWD to mimic being in a monorepo
    process.env.INIT_CWD = '/path/to/monorepo/package4'

    const plugin: Plugin = pluginCacheDir()
    plugin.configResolved(config)

    expect(config.test?.cache?.dir).toBe(dir)
  })
})
