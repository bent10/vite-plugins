import { extname } from 'node:path'
import * as prettier from 'prettier'
import type { Options as PluginFormatOptions } from 'prettier'
import type { Plugin } from 'vite'
import { getConfig } from './utils.js'

/**
 * Type definition for Prettier options used in the plugin.
 */
export type { PluginFormatOptions }

/**
 * Vite plugin to format code and assets using Prettier.
 *
 * @param options - Optional Prettier options to override default configuration.
 * @returns The Vite plugin object.
 */
export default function pluginFormat(options?: PluginFormatOptions): Plugin {
  let hasSourcemap = false
  let isMinifyDisabled = true

  return {
    name: 'plugin-format',
    enforce: 'post',
    configResolved({ build: { minify, sourcemap } }) {
      hasSourcemap = sourcemap !== false
      isMinifyDisabled = minify === false
    },
    async generateBundle(_, bundle) {
      for (const id in bundle) {
        // since prettier does not modify the sourcemap, it must be ignored
        // if the bundle has sourcemap, to avoid incorrect sourcemap issue
        if (hasSourcemap) continue

        const info = bundle[id]
        const config = await getConfig(id)
        const resolvedConfig = { ...config, ...options }

        // format asset
        if (info.type === 'asset') {
          // leave the `.html` file to be formatted via `transformIndexHtml` hook
          if (extname(id) === '.html') continue

          info.source = await prettier.format(String(info.source), {
            parser: extname(id).slice(1),
            ...resolvedConfig
          })

          continue
        }

        // format chunk
        if (info.type === 'chunk' && isMinifyDisabled) {
          info.code = await prettier.format(info.code, {
            parser: 'babel',
            ...resolvedConfig
          })
        }
      }
    },
    async transformIndexHtml(html, { path }) {
      const config = await getConfig(`${path}.html`)
      const resolvedConfig = { ...config, ...options }

      return prettier.format(html, { ...resolvedConfig, parser: 'html' })
    }
  }
}
