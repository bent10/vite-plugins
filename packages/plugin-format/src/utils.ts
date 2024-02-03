import * as prettier from 'prettier'
import { DEFAULT_CONFIG } from './constans.js'

/**
 * Asynchronously gets the Prettier configuration for a given file.
 *
 * @param id - The file ID.
 * @returns The Prettier configuration options for the file.
 */
export async function getConfig(id: string) {
  const config = await prettier.resolveConfigFile()

  return config === null
    ? DEFAULT_CONFIG
    : prettier.resolveConfig(id, { config })!
}
