/**
 * Options for the Vendor plugin in Vite.
 */
export interface PluginVendorOptions {
  /**
   * Determines which build modes this plugin should apply to.
   *
   * If `true`, the plugin will apply to all build modes.
   *
   * If `false`, the plugin will apply to no build modes.
   *
   * If an array of strings is provided, the plugin will only apply to the specified
   * build modes.
   *
   * @default ['static']
   */
  applyOnMode?: boolean | string[]

  /**
   * The destination directory for generated vendor files.
   *
   * @default 'vendors'
   */
  dest?: string

  /**
   * A manual list of vendor entries to include.
   *
   * @default undefined
   */
  manualEntry?: VendorEntries
}

/**
 * A collection of vendor entries, where the keys are vendor names and the
 * values are the vendor entry details.
 */
export type VendorEntries = {
  [vendorName: string]: VendorEntry
}

/**
 * The details of a vendor entry.
 */
export type VendorEntry = {
  /**
   * The file or files to include in the vendor bundle.
   *
   * Can be a string or an array of strings representing file paths or globs.
   */
  files: string | string[]

  /**
   * Whether to flatten the file structure of the vendor bundle.
   *
   * If `true`, all files will be placed in the root of the vendor bundle.
   *
   * If `false`, the file structure of the source files will be preserved.
   *
   * @default false
   */
  flat?: boolean

  /**
   * A new name or rename function for each file in the vendor bundle.
   *
   * Can be a string to rename all files to the same name, or a function that
   * takes a file path and returns a new name.
   */
  rename?: string | ((filepath: string) => string)
}

/**
 * Configuration for the file copying queue.
 */
export type QueueConfig = {
  root: string
  vendorDir: string
  manualEntry: VendorEntries
}
