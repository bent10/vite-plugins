import { promises as fsp } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'
import type { PluginVendorOptions, VendorEntries } from './types.js'
import { createQueue, getEntries } from './utils.js'

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
): Plugin[] {
  const {
    applyOnMode = ['static'],
    dest = 'vendors',
    manualEntry = {}
  } = options
  let resolvedRoot: string, resolvedPublicDir: string

  return [
    {
      name: 'plugin-vendor',
      enforce: 'pre',
      apply({ preview }, { mode }) {
        const isAllowedMode =
          typeof applyOnMode === 'boolean'
            ? applyOnMode
            : applyOnMode?.indexOf(mode) !== -1

        return !preview && isAllowedMode
      },
      configResolved({ publicDir, root }) {
        resolvedRoot = root
        resolvedPublicDir = publicDir
      },
      async buildStart() {
        try {
          const vendorDir = join(resolvedPublicDir, dest)
          const entries = getEntries()
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
    },
    {
      name: 'plugin-vendor:reset',
      enforce: 'pre',
      async configResolved({ publicDir }) {
        const vendorDir = join(publicDir, dest)
        // make sure you always get fresh copy for next run
        await fsp.rm(vendorDir, { recursive: true, force: true })
      }
    }
  ]
}
