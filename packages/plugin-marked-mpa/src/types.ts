import type { Stats } from 'node:fs'
import type { Eta } from 'eta'
import type { MarkedExtension } from 'marked'

export interface FrontmatterOptions {
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
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema?: any

  /**
   * Compatibility with JSON.parse behaviour.
   */
  json?: boolean
}

export type EtaConfig = NonNullable<ConstructorParameters<typeof Eta>[0]>

/**
 * Options for the Vite plugin 'pluginMarkedMpa'.
 */
export interface PluginMarkedMpaOptions {
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
  frontmatter?: FrontmatterOptions

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

/**
 * Options for the processor, extending the `PluginMarkedMpaOptions` and
 * specifying the 'root' property.
 */
export interface ProcessorOptions {
  root: string
  layouts: string
  eta: Eta
  extensions?: PluginMarkedMpaOptions['extensions']
}

/**
 * Represents a map of routes with URLs as keys.
 */
export interface Routes {
  [url: string]: Route
}

/**
 * Represents a route within the Multi-Page Application (MPA).
 */
export type Route = {
  stem: string

  /**
   * The source of the route.
   */
  source: string

  /**
   * The unique identifier of the route.
   */
  id: string

  /**
   * The URL of the route.
   */
  url: string

  /**
   * Indicates whether the route is an index route.
   */
  isAlias: boolean
}

/**
 * Represent a route by id.
 */
export interface RouteMap {
  [id: string]: Omit<Route, 'isAlias'>
}

/**
 * Data structure that may include unknown properties.
 */
export type Context = UnknownData & ServerContext & MarkedContext

/**
 * Represents an object with properties of unknown data.
 */
export interface UnknownData {
  [key: string]: unknown
}

/**
 * Additional data added during the vite process.
 */
export interface ServerContext {
  NODE_ENV: string
  isDev: boolean
  routes: RouteMap
  route: Omit<Route, 'isAlias'>
  useWith: { [id: string]: string }

  /**
   * An object provides information about a file, required `enableDataStats: true`.
   */
  stats?: Stats
}

/**
 * Additional data added during the Marked process.
 */
export interface MarkedContext {
  matterDataPrefix: string | false
  datasources: string[]
  datasourcesAncestor: string

  /**
   * The layout specified by the user.
   */
  layout: {
    id: string
    raw: string
  }

  /**
   * The title specified by the user.
   */
  title?: string

  /**
   * An array of CSS assets specified by the user.
   */
  css?: Array<string | Attrs>

  /**
   * An array of JavaScript assets specified by the user.
   */
  js?: Array<string | Attrs>

  /**
   * An array of headings included in the content.
   *
   * **Note** that this object is only available after the Markdown has been parsed to HTML.
   */
  headings: Heading[]
}

/**
 * Headings information, can be used to create table of content
 */
export interface Heading {
  /**
   * The level of the heading.
   */
  level: number

  /**
   * The text content of the heading.
   */
  text: string

  /**
   * The unique identifier of the heading.
   */
  id: string

  /**
   * Optional children headings if available.
   */
  children?: Heading[]
}

/**
 * Represents attributes with keys as strings and values as strings, booleans,
 * or undefined.
 */
export interface Attrs {
  [key: string]: string | boolean | undefined
}
