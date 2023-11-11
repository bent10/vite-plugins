import { join } from 'node:path'
import fg from 'fast-glob'
import { normalizePath } from 'vite'
import type { Heading, UnknownData } from './types.js'

/**
 * Normalizes the data source for the processor.
 */
export function normalizeDataSource(
  source: string | string[] | UnknownData,
  cwd = ''
) {
  switch (typeof source) {
    case 'string':
      return normalizeSource(source, cwd)

    case 'object':
      if (Array.isArray(source)) {
        return source.map(src => normalizeSource(src, cwd))
      }
      return source

    default:
      return {}
  }
}

/**
 * Normalize the source string by appending allowed file extensions and
 * joining with the current working directory.
 */
export function normalizeSource(source: string, cwd = '') {
  const allowedExts = 'cjs,js,json,yml,yaml'
  const normalizedSource = fg.isDynamicPattern(source)
    ? source
    : `${source}/**/*.{${allowedExts}}`

  return normalizePath(join(cwd, normalizedSource))
}

/**
 * Checks if all items in an array are strings.
 */
export function isDatasources(items: unknown[]) {
  for (const item of items) {
    if (typeof item !== 'string') {
      return false
    }
  }

  return true
}

/**
 * Groups heading data by level.
 */
export function groupHeadingsByLevel(headingList: Omit<Heading, 'children'>[]) {
  const root = []
  const stack = []

  for (const heading of headingList) {
    const item: Heading = { ...heading }

    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop()
    }

    if (stack.length > 0) {
      stack[stack.length - 1].children = stack[stack.length - 1].children || []
      stack[stack.length - 1].children?.push(item)
    } else {
      root.push(item)
    }

    stack.push(item)
  }

  return root
}
