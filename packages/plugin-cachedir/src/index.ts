import { relative, resolve } from 'node:path'
import type { Plugin } from 'vite'

const DEFAULT_VITE_CACHE_DIR = 'node_modules/.vite'

/**
 * Vite plugin to resolve the default cache directory in a monorepo.
 *
 * @returns A Vite plugin object.
 */
export default function pluginCacheDir(): Plugin {
  // @see https://docs.npmjs.com/cli/v7/using-npm/changelog#v7220-2021-09-02
  const localPrefix = process.env['npm_config_local_prefix']

  return {
    name: 'vite:plugin-cachedir',
    config({ cacheDir = DEFAULT_VITE_CACHE_DIR, root = process.cwd() } = {}) {
      if (cacheDir === DEFAULT_VITE_CACHE_DIR && !!localPrefix) {
        return {
          cacheDir: resolve(relative(root, localPrefix), DEFAULT_VITE_CACHE_DIR)
        }
      }
    }
  }
}
