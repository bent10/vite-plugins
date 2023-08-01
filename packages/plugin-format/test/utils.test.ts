import { DEFAULT_CONFIG } from '../src/constans.js'
import { getConfig } from '../src/utils.js'
import { MockedFunction } from 'vitest'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrettierMock = MockedFunction<any>

// Mock the prettier.resolveConfigFile and prettier.resolveConfig functions
vi.mock('prettier', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = (await vi.importActual('prettier')) as any

  return {
    ...actual,
    resolveConfigFile: vi.fn(),
    resolveConfig: vi.fn()
  }
})

describe('getConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets Prettier configuration for a given file', async () => {
    const id = 'index.js'
    const config = { semi: true, tabWidth: 4 }
    const prettierMock = (await import('prettier')) as unknown as PrettierMock

    // Mock the prettier.resolveConfigFile to return a config file path
    prettierMock.resolveConfigFile.mockResolvedValue('/path/to/.prettierrc')

    // Mock the prettier.resolveConfig to return the resolved config
    prettierMock.resolveConfig.mockResolvedValue(config)

    const resolvedConfig = await getConfig(id)

    expect(prettierMock.resolveConfigFile).toHaveBeenCalled()
    expect(prettierMock.resolveConfig).toHaveBeenCalledWith(id, {
      config: '/path/to/.prettierrc'
    })
    expect(resolvedConfig).toEqual(config)
  })

  it('returns default config when Prettier cannot resolve config file', async () => {
    const id = 'index.js'
    const prettierMock = (await import('prettier')) as unknown as PrettierMock

    // Mock the prettier.resolveConfigFile to return null (no config file found)
    prettierMock.resolveConfigFile.mockResolvedValue(null)

    const resolvedConfig = await getConfig(id)

    expect(prettierMock.resolveConfigFile).toHaveBeenCalled()
    expect(prettierMock.resolveConfig).not.toHaveBeenCalled()
    expect(resolvedConfig).toEqual(DEFAULT_CONFIG)
  })
})
