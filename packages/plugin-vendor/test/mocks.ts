export async function mockFs() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = (await vi.importActual('node:fs')) as any

  return {
    ...actual,
    readFileSync: vi.fn(() =>
      JSON.stringify({
        dependencies: {
          foo: '1.0.0',
          bar: '2.0.0'
        }
      })
    ),
    promises: {
      cp: vi.fn(),
      rm: vi.fn()
    }
  }
}

export async function mockPath() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = (await vi.importActual('node:path')) as any

  return {
    ...actual,
    resolve: vi.fn(() => '/path/to/root/node_modules')
  }
}

export async function mockFastGlob() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = (await vi.importActual('fast-glob')) as any

  return {
    ...actual,
    default: {
      sync: vi.fn(source =>
        source.map((f: string) => f.replace('**/*', 'index.js'))
      )
    }
  }
}
