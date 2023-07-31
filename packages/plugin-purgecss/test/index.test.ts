import pluginPurgeCSS from '../src/index.js'

describe('pluginPurgeCSS', () => {
  it('applies PurgeCSS options to the Vite config', () => {
    // Mock the options for PurgeCSS
    const purgeCSSOptions = {
      content: ['**/*.html', '**/*.js'],
      safelist: ['bg-red-500', 'text-blue-600']
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pluginOptions = pluginPurgeCSS(purgeCSSOptions) as any
    const viteConfig = pluginOptions.config()

    expect(viteConfig.css?.postcss?.plugins[0]).toHaveProperty(
      'postcssPlugin',
      'postcss-purgecss'
    )
    expect(viteConfig.css?.postcss?.plugins[0]).toHaveProperty(
      'postcssPlugin',
      'postcss-purgecss'
    )
  })

  it('correctly sets the plugin name and apply/enforce properties', () => {
    const purgeCSSOptions = {
      content: ['**/*.html', '**/*.js']
    }

    const pluginOptions = pluginPurgeCSS(purgeCSSOptions)

    expect(pluginOptions.name).toBe('plugin-purgecss')
    expect(pluginOptions.apply).toBe('build')
    expect(pluginOptions.enforce).toBe('post')
  })
})
