# Vite Plugin Marked MPA

A Vite plugin for rendering Markdown files to HTML for Multi-Page Applications.

## Install

```bash
npm i vite-plugin-marked-mpa -D
# Or
yarn add vite-plugin-marked-mpa --dev
```

## Usage

```js
import pluginMpa from 'vite-plugin-marked-mpa'

export default {
  plugins: [
    pluginMpa({
      // Your configuration options here
    })
  ]
}
```

## Options

Below are the available options:

- `root`: Controls the top-level directory for `layouts`, `pages`, `partials`, and `data` sources.

- `pages`: Specifies the directory where your Markdown pages are located.

- `partials`: Directory that contains partial templates.

- `layouts`: Configuration options for layouts. Refer to the documentation of [`marked-hook-layout`](https://github.com/bent10/marked-extensions/tree/main/packages/hook-layout) for details.

- `data`: Specifies the directory or directories containing data sources for your pages. Refer to the documentation of [`marked-hook-data`](https://github.com/bent10/marked-extensions/tree/main/packages/hook-data) for details.

- `frontmatter`: Configuration options for frontmatter processing. Refer to the documentation of [`marked-hook-frontmatter`](https://github.com/bent10/marked-extensions/tree/main/packages/hook-frontmatter) for details.

- `eta`: Configuration options for the Eta template engine.

- `extensions`: An array of `marked` extensions to enhance the Markdown processing.

- `enableDataStats`: Enables information about the file in the `data.stats` object, such as `size`, `ctime`, `mtime`, etc. Note that enabling this option can impact performance, as it requires stat calls to get file metadata on every render.

```js
import pluginMpa from 'vite-plugin-marked-mpa'

export default {
  plugins: [
    pluginMpa({
      root: 'src', // Your project root directory
      pages: 'pages', // The directory where your Markdown pages are located
      partials: '_partials', // Directory that contains partial templates
      layouts: {
        dir: '_layouts' // The directory where your layout files are located
      },
      data: ['_data', '_more-data'], // Directories containing data sources
      frontmatter: {
        dataPrefix: 'page' // Parse frontmatter as member of 'page' object
      },
      eta: {
        // Eta template engine configuration options
      },
      extensions: [], // Additional marked extensions
      enableDataStats: false // Disable data file statistics
    })
  ]
}
```

## License

![GitHub](https://img.shields.io/github/license/bent10/vite-plugins)

A project by [Stilearning](https://stilearning.com) &copy; 2023.
