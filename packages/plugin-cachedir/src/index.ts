import { accessSync, constants } from 'node:fs'
import { relative, resolve } from 'node:path'
import type { Plugin } from 'vite'

/**
 * Vite plugin to resolve the default cache directory in a monorepo.
 *
 * @returns A Vite plugin object.
 */
export default function pluginCacheDir(): Plugin {
  const cacheDir = 'node_modules/.vite'
  const cacheDirTest = 'node_modules/.vitest'

  return {
    name: 'plugin-cachedir',
    configResolved(config) {
      if (config.cacheDir === resolve(cacheDir) && !!process.env.INIT_CWD) {
        try {
          accessSync('node_modules', constants.F_OK)
        } catch {
          Object.assign(config, {
            cacheDir: resolve(
              relative(config.root, process.env.INIT_CWD),
              cacheDir
            )
          })
        }
      }

      if (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        !config.test?.cache &&
        !!process.env.INIT_CWD
      ) {
        try {
          accessSync('node_modules', constants.F_OK)
        } catch {
          Object.assign(config, {
            test: {
              cache: {
                dir: resolve(
                  relative(config.root, process.env.INIT_CWD),
                  cacheDirTest
                )
              }
            }
          })
        }
      }
    }
  }
}
