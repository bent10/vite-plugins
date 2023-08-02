# Vite Plugin Vendor

The Vite Plugin Vendor is a ViteJS plugin that generates vendor bundles based on the specified options. This plugin allows you to include specific vendor dependencies in your build and customize their output.

## How It Works

The plugin scans the `dependencies` section of the `package.json` file to fetch vendor entries. Each entry corresponds to a vendor package, and the plugin will look for files that match the specified globs in the `dist` directory of the vendor package.

During the build process, the plugin will copy the identified files to the specified destination directory.

## Install

You can install the Vite Plugin Vendor using npm or yarn:

```bash
# With npm
npm i -D vite-plugin-vendor

# With yarn
yarn add vite-plugin-vendor --dev
```

## Usage

To use the plugin, simply import it and add it to the plugins array in your Vite config file:

```javascript
// vite.config.js
import pluginVendor from 'vite-plugin-vendor'

export default {
  plugins: [
    pluginVendor({
      applyOnMode: true,
      dest: 'vendor',
      manualEntry: {
        'my-vendor': {
          files: 'dist/my-vendor.js',
          flat: true
        }
      }
    })
  ]
}
```

## Options

The Vite Plugin Vendor accepts the following options:

### `applyOnMode` (optional)

Determines which build modes this plugin should apply to.

- If `true`, the plugin will apply to all build modes.
- If `false`, the plugin will apply to no build modes.
- If an array of strings is provided, the plugin will only apply to the specified build modes.

Default value: `['static']`

### `dest` (optional)

The destination directory for generated vendor files. The generated vendor files will be placed in this directory.

Default value: `'vendors'`

### `manualEntry` (optional)

You can manually specify vendor entries and their details using the `manualEntry` option. This is useful when you want to include specific files that are not covered by the automatic scanning of the `package.json` dependencies.

Example:

```javascript
// vite.config.js
import pluginVendor from 'vite-plugin-vendor'

export default {
  plugins: [
    pluginVendor({
      manualEntry: {
        bootstrap: {
          files: ['dist/js/bootstrap.js', 'dist/js/bootstrap.min.js'],
          flat: true,
          rename: filepath => {
            const version =
              require('./node_modules/bootstrap/package.json').version
            return filepath.replace(/\.js$/, `-${version}.js`)
          }
        }
      }
    })
  ]
}
```

- `files`: The file or files to include in the vendor bundle. It can be a string or an array of strings representing file paths or globs.
- `flat` (optional): Whether to flatten the file structure of the vendor bundle. If `true`, all files will be placed in the root of the vendor bundle. If `false`, the file structure of the source files will be preserved. Default value: `false`.
- `rename` (optional): A new name or rename function for each file in the vendor bundle. It can be a string to rename all files to the same name, or a function that takes a file path and returns a new name.

## License

![GitHub](https://img.shields.io/github/license/bent10/monorepo-starter)

A project by [Stilearning](https://stilearning.com) &copy; 2023.
