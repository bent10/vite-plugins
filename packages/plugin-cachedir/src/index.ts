import { relative, resolve } from 'node:path'
import type { Plugin, UserConfig } from 'vite'
import { InlineConfig } from 'vitest'

const DEFAULT_VITE_CACHE_DIR = 'node_modules/.vite'
const DEFAULT_VITEST_CACHE_DIR = 'node_modules/.vitest'
const DEFAULT_VITEST_CACHE = {
  cache: {
    dir: DEFAULT_VITEST_CACHE_DIR
  }
}

/**
 * Vite plugin to resolve the default cache directory in a monorepo.
 *
 * @returns A Vite plugin object.
 */
export default function pluginCacheDir(): Plugin[] {
  // @see https://docs.npmjs.com/cli/v7/using-npm/changelog#v7220-2021-09-02
  const localPrefix = process.env['npm_config_local_prefix']

  return [
    {
      name: 'vite:plugin-cachedir',
      config({
        cacheDir = DEFAULT_VITE_CACHE_DIR,
        root = process.cwd()
      }: UserConfig = {}) {
        if (cacheDir === DEFAULT_VITE_CACHE_DIR && !!localPrefix) {
          return {
            cacheDir: resolve(
              relative(root, localPrefix),
              DEFAULT_VITE_CACHE_DIR
            )
          }
        }
      }
    },
    {
      name: 'vitest:plugin-cachedir',
      apply({ mode }) {
        return mode === 'test'
      },
      config({
        root = process.cwd(),
        test = DEFAULT_VITEST_CACHE
      }: UserConfig & { test?: InlineConfig } = {}) {
        if (
          (!test?.cache || test.cache.dir === DEFAULT_VITEST_CACHE_DIR) &&
          !!localPrefix
        ) {
          return {
            test: {
              cache: {
                dir: resolve(
                  relative(root, localPrefix),
                  DEFAULT_VITEST_CACHE_DIR
                )
              }
            }
          }
        }
      }
    }
  ]
}
