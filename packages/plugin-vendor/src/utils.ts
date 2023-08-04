import { readFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import * as fg from 'fast-glob'
import type { QueueConfig, VendorEntries } from './types.js'

/**
 * Fetches the vendor entries from the package.json dependencies.
 *
 * @returns The vendor entries.
 */
export function getEntries() {
  const vendors: VendorEntries = {}
  const { dependencies = {} } = JSON.parse(
    readFileSync('./package.json', 'utf8')
  )

  for (const id of Object.keys(dependencies)) {
    vendors[id] = { files: 'dist/**/*' }
  }

  return vendors
}

/**
 * Creates a queue of files to copy to the vendor directory.
 *
 * @param entries - The vendor entries.
 * @param config - The configuration for the file copying queue.
 * @returns The file copying queue.
 */
export function createQueue(entries: VendorEntries, config: QueueConfig) {
  const { root, vendorDir, manualEntry } = config
  // @see https://docs.npmjs.com/cli/v7/using-npm/changelog#v7220-2021-09-02
  const localPrefix = process.env['npm_config_local_prefix']
  const nodeModulesDir = resolve(
    relative(root, localPrefix || process.cwd()),
    'node_modules'
  )
  const queue: Array<{ from: string; to: string }> = []

  Object.assign(entries, manualEntry)

  for (const [name, entry] of Object.entries(entries)) {
    const baseDir = join(nodeModulesDir, name)
    const source =
      typeof entry.files === 'string'
        ? join(baseDir, entry.files)
        : entry.files.map(f => join(baseDir, f))

    const files = fg.sync(source, { onlyFiles: true })

    for (const file of files) {
      const filepath = file.replace(nodeModulesDir, '')
      const newName =
        typeof entry.rename === 'string'
          ? entry.rename
          : typeof entry.rename === 'function'
          ? entry.rename(filepath)
          : join(entry.flat ? name : dirname(filepath), basename(filepath))

      queue.push({
        from: file,
        to: join(vendorDir, newName)
      })
    }
  }

  return queue
}
