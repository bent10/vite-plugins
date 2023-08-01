# Vite Plugin CacheDir

Vite plugin to resolve the default cache directory in a monorepo.

This plugin is designed to assist in setting the appropriate cache directory when building a Vite project within a monorepo environment. It helps ensure that the correct cache directories are used, especially when working with multiple projects that share dependencies.

## Install

You can install this plugin using your preferred package manager:

```bash
# With npm
npm i -D vite-plugin-cachedir

# With yarn
yarn add vite-plugin-cachedir --dev
```

## Usage

To use the plugin, simply import it and add it to the plugins array in your Vite config file:

```javascript
// vite.config.js
import pluginCacheDir from 'vite-plugin-cachedir'

export default {
  plugins: [pluginCacheDir()]
}
```

## License

![GitHub](https://img.shields.io/github/license/bent10/monorepo-starter)

A project by [Stilearning](https://stilearning.com) &copy; 2023.
