import { promises as fsp } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'
import type { PluginVendorOptions, VendorEntries } from './types.js'
import { normalizePath, createQueue, getEntries } from './utils.js'

export type { PluginVendorOptions, VendorEntries }

/**
 * The Vite plugin that generates vendor bundles based on the specified
 * options.
 *
 * @param options - The options for the Vendor plugin.
 * @returns An array of Vite plugin options.
 */
export default function pluginVendor(
  options: PluginVendorOptions = {}
): Plugin {
  const {
    applyOnMode = true,
    dest = 'vendors',
    ignore = [],
    manualEntry = {}
  } = options
  let resolvedRoot: string, vendorDir: string

  return {
    name: 'vite:plugin-vendor',
    enforce: 'pre',
    apply({ preview, mode = '' }) {
      const isAllowedMode =
        typeof applyOnMode === 'boolean'
          ? applyOnMode
          : applyOnMode?.indexOf(mode) !== -1

      return !preview && isAllowedMode
    },
    async configResolved({ publicDir, root }) {
      resolvedRoot = root
      vendorDir = normalizePath(join(publicDir, dest))

      // make sure to always get fresh copy for the next run
      await fsp.rm(vendorDir, { recursive: true, force: true })
    },
    async buildStart() {
      try {
        const entries = getEntries(ignore)
        const queue = createQueue(entries, {
          root: resolvedRoot,
          vendorDir,
          manualEntry
        })

        // copying...
        await Promise.all(
          queue.map(
            async ({ from, to }) =>
              await fsp.cp(from, to, {
                preserveTimestamps: true,
                recursive: true
              })
          )
        )
      } catch (e) {
        throw e
      }
    }
  }
}
