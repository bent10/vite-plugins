# vite-plugin-resolve-umd-format

Vite plugin that use `.js` extension for the UMD format.

## Why?

Since Vite v3, UMD modules are resolved with the `.cjs` extension by default (for CommonJS, indicating a Node module), which causes it to be served with the Content-Type header “application/node”. We need to rename it to `.js` so that it gets served with the correct MIME type.

## Install

You can install this plugin using your preferred package manager:

```bash
# With npm
npm i -D vite-plugin-resolve-umd-format

# With yarn
yarn add vite-plugin-resolve-umd-format --dev
```

## Usage

To use the plugin, simply import it and add it to the plugins array in your Vite config file:

```js
// vite.config.js
import umdFormatResolver from 'vite-plugin-resolve-umd-format'

export default {
  plugins: [umdFormatResolver()]
}
```

## License

![GitHub](https://img.shields.io/github/license/bent10/vite-plugins)

A project by [Stilearning](https://stilearning.com) &copy; 2023.
