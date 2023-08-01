import type { Options } from 'prettier'

/**
 * Default configuration for Prettier options used in the plugin.
 */
export const DEFAULT_CONFIG: Options = {
  arrowParens: 'avoid',
  jsxSingleQuote: true,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  vueIndentScriptAndStyle: false
}
