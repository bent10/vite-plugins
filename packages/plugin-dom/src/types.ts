import type { ChildNode, Element } from 'domhandler'
import type { DomUtils } from 'htmlparser2'

/**
 * Options for the Vite DOM plugin.
 */
export interface DomOptions {
  /**
   * Specifies the modes on which the plugin should be applied. When set to
   * `true`, the plugin will be applied on all modes. When set to an array of
   * strings, the plugin will be applied only on the specified modes.
   *
   * @default ['static']
   */
  applyOnMode?: boolean | string[]

  /**
   * Selectors to match comments.
   */
  comments?: CommentSelectors

  /**
   * Callback function to handle elements in the DOM.
   */
  handler?: DomHandler

  /**
   * Callback function to handle the complete DOM after parsing.
   */
  onComplete?: DomCallback
}

/**
 * Selectors to match comments.
 */
export type CommentSelectors = {
  /**
   * Array of tag names or regular expressions to match for adding
   * comments.
   */
  tags?: Pattern[]

  /**
   * Array of class names or regular expressions to match for adding
   * comments.
   */
  classes?: Pattern[]

  /**
   * Array of element IDs or regular expressions to match for adding
   * comments.
   */
  ids?: Pattern[]
}

export type Pattern = string | RegExp

/**
 * Callback function to handle elements in the DOM.
 */
export type DomHandler = (
  this: DomContext,
  element: Element
) => void | Promise<void>

/**
 * Callback function to handle the complete DOM after parsing.
 */
export type DomCallback = (
  this: DomContext,
  dom: ChildNode[],
  error: Error | null
) => void | Promise<void>

/**
 * The context type for the DOM handler functions.
 */
export type DomContext = typeof DomUtils
