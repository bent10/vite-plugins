# Vite Plugin Format

Vite Plugin Format is a Vite plugin that enables code and asset formatting using [Prettier](https://prettier.io) during the build process.

## Install

You can install this plugin using your preferred package manager:

```bash
# With npm
npm i -D vite-plugin-format

# With yarn
yarn add vite-plugin-format --dev
```

## Usage

To use Vite Plugin Format, you need to add it to your Vite configuration as a plugin. Here's how you can do it:

```javascript
import { defineConfig } from 'vite'
import pluginFormat from 'vite-plugin-format'

export default defineConfig({
  // other Vite config options
  plugins: [
    // other plugins
    pluginFormat({
      semi: true,
      tabWidth: 4
    })
  ]
})
```

## Options

The `pluginFormat` function accepts an optional object parameter to override the default configuration options for Prettier. The options object corresponds to the same options supported by Prettier. You can refer to the [Prettier documentation](https://prettier.io/docs/en/options.html) for more details about the available options.

If no options are provided, the plugin will use the default configuration:

```javascript
const DEFAULT_CONFIG = {
  arrowParens: 'avoid',
  jsxSingleQuote: true,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  vueIndentScriptAndStyle: false
}
```

## Note

The plugin uses Prettier to format assets and chunks. HTML files are formatted using Prettier's HTML parser.

Since Prettier does not modify the sourcemap, the plugin takes care to avoid incorrect sourcemap issues. The plugin will also consider the build configuration to handle minification and sourcemap generation accordingly.

## License

![GitHub](https://img.shields.io/github/license/bent10/vite-plugins)

A project by [Stilearning](https://stilearning.com) &copy; 2022-2023.
