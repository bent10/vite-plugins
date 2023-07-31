import purgecss, {
  type UserDefinedOptions as PluginPurgeCSSOptions
} from '@fullhuman/postcss-purgecss'
import type { AcceptedPlugin } from 'postcss'
import type { Plugin } from 'vite'

const purgeCSSFn = purgecss as unknown as (
  opts?: PluginPurgeCSSOptions
) => AcceptedPlugin

/**
 * The options object for the PurgeCSS plugin.
 *
 * @see {@link https://github.com/FullHuman/purgecss}
 */
export type { PluginPurgeCSSOptions }

/**
 * Vite plugin to enable PurgeCSS for the build.
 *
 * @param options - The PurgeCSS plugin options.
 * @returns Vite Plugin Object.
 */
export default function pluginPurgeCSS(
  options?: PluginPurgeCSSOptions
): Plugin {
  return {
    name: 'plugin-purgecss',
    apply: 'build',
    enforce: 'post',
    config() {
      return {
        css: {
          postcss: { plugins: [purgeCSSFn(options)] }
        }
      }
    }
  }
}
