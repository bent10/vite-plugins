import { join } from 'node:path'
import pluginCacheDir from '../src/index.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Plugin = Record<string, any>

describe('pluginCacheDir', () => {
  const cwd = '/path/to/project'

  beforeEach(() => {
    // Set process.env.INIT_CWD to mimic being in a monorepo
    process.env.INIT_CWD = cwd
  })

  it('resolves the default cache directory in Vite config', () => {
    const [plugin]: Plugin[] = pluginCacheDir()
    const config = plugin.config()

    expect(config.cacheDir).toBe(join(cwd, 'node_modules/.vite'))
  })

  it("does not resolve cache directory if it's already provided in Vite config", () => {
    const [plugin]: Plugin[] = pluginCacheDir()
    const config = plugin.config({ cacheDir: 'foo' })

    expect(config).toBeUndefined()
  })

  it('resolves the default test cache directory in Vite config', () => {
    const [, plugin]: Plugin[] = pluginCacheDir()
    const config = plugin.config()

    expect(config.test?.cache?.dir).toBe(join(cwd, 'node_modules/.vitest'))
  })

  it("does not resolve test cache directory if it's already provided in Vite config", () => {
    const [, plugin]: Plugin[] = pluginCacheDir()
    const config = plugin.config({ test: { cache: { dir: 'foo' } } })

    expect(config).toBeUndefined()
  })
})
