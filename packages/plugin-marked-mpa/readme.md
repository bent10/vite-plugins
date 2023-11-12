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
import markedAlert from 'marked-alert'
import { createDirectives } from 'marked-directive'
import mpa from 'vite-plugin-marked-mpa'

export default {
  plugins: [
    mpa({
      // Your configuration options here
      extensions: [markedAlert(), createDirectives()]
    })
  ]
}
```

For more details, please explore the [`example`](https://github.com/bent10/vite-plugins/tree/main/packages/plugin-marked-mpa/example) folder.

## Options

Below is the available options:

```ts
interface PluginMarkedMpaOptions {
  /**
   * Controls the top-level directory for `layouts`, `pages`, `partials`, and
   * `data` sources.
   *
   * @default 'src'
   */
  root?: string

  /**
   * The path to the directory containing Markdown pages, relative to the `root`
   * directory.
   *
   * @default 'pages'
   */
  pages?: string

  /**
   * An array of glob pattern to exclude page files from processing, relative to
   * the `pages` directory.
   *
   * @default ['**\/_*.md']
   */
  ignore?: string[]

  /**
   * The path to the directory containing Layout files, relative to the `root`
   * directory.
   *
   * @default '_layouts'
   */
  layouts?: string

  /**
   * The path to the directory containing partial files, relative to the `root`
   * directory.
   *
   * @default '_partials'
   */
  partials?: string

  /**
   * Options for handling frontmatter in Markdown files.
   */
  frontmatter?: {
    /**
     * The prefix to use for hooks data when adding frontmatter data. If `true`,
     * the data will be added to the `matter` property of the hooks data. If a
     * string is provided, the data will be added with that string as the key.
     *
     * @default false
     */
    dataPrefix?: boolean | string

    /**
     * Specifies a schema to use.
     *
     * @default DEFAULT_SCHEMA
     */
    schema?: Schema

    /**
     * Compatibility with JSON.parse behaviour.
     *
     * @default false
     */
    json?: boolean
  }

  /**
   * Specifies the data source or an array of data sources, relative to the `root`
   * directory.
   *
   * @default '_data'
   */
  data?: string | string[] | UnknownData

  /**
   * Set to `true` to disable merging data from multiple data sources.
   */
  disableDataMerge?: boolean

  /**
   * Options for the template engine.
   *
   * @see [Eta Docs](https://eta.js.org/docs/api/configuration)
   */
  eta?: Omit<EtaConfig, 'views' | 'useWith' | 'varName' | 'autoTrim'>

  /**
   * An array of custom Marked extensions.
   *
   * @see [Marked extensions](https://github.com/bent10/marked-extensions)
   */
  extensions?: MarkedExtension[]

  /**
   * Enables information about the file in the `data.stats` object, such as
   * `size`, `ctime`, `mtime`, etc.
   *
   * **Note:** This option will decrease performance as it requires stat calls to get
   * file metadata on every render.
   */
  enableDataStats?: boolean
}
```

## License

![GitHub](https://img.shields.io/github/license/bent10/vite-plugins)

A project by [Stilearning](https://stilearning.com) &copy; 2023.
