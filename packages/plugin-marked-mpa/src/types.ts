import type { Stats } from 'node:fs'
import type { MarkedExtension } from 'marked'
import type { Eta } from 'eta'
import type { Options as FrontmatterOptions } from 'marked-hook-frontmatter'
import type { Options as LayoutsOptions } from 'marked-hook-layout'

export type EtaConfig = NonNullable<ConstructorParameters<typeof Eta>[0]>

/**
 * Options for the Vite plugin 'pluginMarkedMpa'.
 */
export interface PluginMarkedMpaOptions {
  /**
   * Controls the top-level directory for layouts, pages, and data sources.
   */
  root?: string

  /**
   * The path to the directory containing the Markdown pages.
   */
  pages?: string

  /**
   * Options for specifying custom layouts.
   */
  layouts?: LayoutsOptions

  /**
   * Specifies the data source or an array of data sources.
   */
  data?: string | string[] | UnknownData

  /**
   * Options for handling frontmatter in Markdown files.
   */
  frontmatter?: FrontmatterOptions

  /**
   * Configuration options for the Eta template engine.
   */
  eta?: Omit<EtaConfig, 'views' | 'useWith' | 'varName'>

  /**
   * An array of custom Marked extensions.
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
export interface ProcessorOptions
  extends Omit<PluginMarkedMpaOptions, 'root' | 'pages'> {
  root: string
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
  source: string
  stem: string
  id: string
  url: string
  isAlias: boolean
}

/**
 * Data structure that may include unknown properties.
 */
export type MatterData = UnknownData & AdditionalProps & AdditionalMatterProps

/**
 * Represents an object with properties of unknown data.
 */
export interface UnknownData {
  [key: string]: unknown
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
 * Additional properties added during the vite and marked process, such as
 * headings and source information.
 */
export interface AdditionalProps {
  /**
   * An array of headings included in the content.
   */
  headings: Heading[]

  /**
   * The source of the content.
   */
  source: string

  /**
   * The unique identifier of the content.
   */
  id: string

  /**
   * The URL of the content.
   */
  url: string

  /**
   * Indicates whether the content is an alias.
   */
  isAlias: boolean

  /**
   * An object provides information about a file, required `enableDataStats: true`.
   */
  stats?: Stats
}
/**
 * Additional properties added by the user through frontmatter.
 */
export interface AdditionalMatterProps {
  /**
   * The layout specified by the user.
   */
  layout?: string

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
}

/**
 * Represents attributes with keys as strings and values as strings, booleans,
 * or undefined.
 */
export interface Attrs {
  [key: string]: string | boolean | undefined
}
