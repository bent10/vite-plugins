/// <reference types="vitest/globals" />
import { normalize } from 'node:path'
import { createQueue } from '../src/utils.js'

type Mock = ReturnType<typeof vi.fn>

vi.mock(
  'node:path',
  await import('./mocks.js').then(({ mockPath }) => mockPath)
)
vi.mock(
  'fast-glob',
  await import('./mocks.js').then(({ mockFastGlob }) => mockFastGlob)
)

describe('createQueue', () => {
  const config = {
    root: '/path/to/root',
    vendorDir: '/path/to/root/vendorDir',
    manualEntry: {}
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Set `npm_config_local_prefix` to mimic being in a monorepo
    process.env['npm_config_local_prefix'] = './'
  })

  const mockFastGlob = async (files: string[]) => {
    const { default: fg } = (await import('fast-glob')) as unknown as {
      default: { sync: Mock }
    }
    fg.sync.mockReturnValueOnce(files)
  }

  it('correctly creates a queue with single file entry', async () => {
    const entries = {
      dependency1: { files: ['dist/file1.js'], flat: true }
    }
    await mockFastGlob(['/path/to/root/node_modules/dependency1/dist/file1.js'])

    const queue = createQueue(entries, config)

    expect(queue).toHaveLength(1)
    expect(queue[0].from).toBe(
      '/path/to/root/node_modules/dependency1/dist/file1.js'
    )
    expect(normalize(queue[0].to)).toBe(
      normalize('/path/to/root/vendorDir/dependency1/file1.js')
    )
  })

  it('correctly creates a queue with multiple file entries', async () => {
    const entries = {
      dependency1: { files: ['dist/file1.js', 'dist/file2.js'], flat: true }
    }
    await mockFastGlob([
      '/path/to/root/node_modules/dependency1/dist/file1.js',
      '/path/to/root/node_modules/dependency1/dist/file2.js'
    ])

    const queue = createQueue(entries, config)

    expect(queue).toHaveLength(2)
    expect(queue[0].from).toBe(
      '/path/to/root/node_modules/dependency1/dist/file1.js'
    )
    expect(normalize(queue[0].to)).toBe(
      normalize('/path/to/root/vendorDir/dependency1/file1.js')
    )
    expect(queue[1].from).toBe(
      '/path/to/root/node_modules/dependency1/dist/file2.js'
    )
    expect(normalize(queue[1].to)).toBe(
      normalize('/path/to/root/vendorDir/dependency1/file2.js')
    )
  })

  it('correctly creates a queue with manual entry and string rename', async () => {
    const entries = {
      dependency1: { files: 'dist/file1.js', flat: true }
    }
    await mockFastGlob(['/path/to/root/node_modules/dependency1/dist/file1.js'])
    await mockFastGlob([
      '/path/to/root/node_modules/manual-vendor/manual/file.js'
    ])

    const queue = createQueue(entries, {
      ...config,
      manualEntry: {
        'manual-vendor': {
          files: 'manual/file.js',
          flat: true,
          rename: 'renamed.js'
        }
      }
    })

    expect(queue).toHaveLength(2)
    expect(queue[0].from).toBe(
      '/path/to/root/node_modules/dependency1/dist/file1.js'
    )
    expect(normalize(queue[0].to)).toBe(
      normalize('/path/to/root/vendorDir/dependency1/file1.js')
    )
    expect(queue[1].from).toBe(
      '/path/to/root/node_modules/manual-vendor/manual/file.js'
    )
    expect(normalize(queue[1].to)).toBe(
      normalize('/path/to/root/vendorDir/renamed.js')
    )
  })

  it('correctly creates a queue with manual entry and function rename', async () => {
    const entries = {
      dependency1: { files: 'dist/file1.js', flat: true }
    }
    await mockFastGlob(['/path/to/root/node_modules/dependency1/dist/file1.js'])
    await mockFastGlob([
      '/path/to/root/node_modules/manual-vendor/manual/file.js'
    ])

    const queue = createQueue(entries, {
      ...config,
      manualEntry: {
        'manual-vendor': {
          files: 'manual/file.js',
          rename: (filepath: string) => filepath.replace('manual/', 'renamed-')
        }
      }
    })

    expect(queue).toHaveLength(2)
    expect(queue[0].from).toBe(
      '/path/to/root/node_modules/dependency1/dist/file1.js'
    )
    expect(normalize(queue[0].to)).toBe(
      normalize('/path/to/root/vendorDir/dependency1/file1.js')
    )
    expect(queue[1].from).toBe(
      '/path/to/root/node_modules/manual-vendor/manual/file.js'
    )
    expect(normalize(queue[1].to)).toBe(
      normalize('/path/to/root/vendorDir/manual-vendor/renamed-file.js')
    )
  })
})
