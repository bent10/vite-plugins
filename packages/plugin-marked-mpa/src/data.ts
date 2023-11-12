import { dirname, extname } from 'node:path'
import ancestorPath from 'common-ancestor-path'
import fg from 'fast-glob'
import { loadFile } from 'loadee'
import setValue from 'set-value'
import { isDatasources } from './utils.js'
import type { Context, UnknownData } from './types.js'

/**
 * Loads data from files or objects and attach it to the context data.
 *
 * @param source - A string specifying file patterns or an object.
 * @param merge - A boolean indicating whether to merge or replace existing data.
 */
export async function retrieveData(
  ctx: Context,
  source: string | string[] | UnknownData,
  merge: boolean
) {
  const { matterDataPrefix } = ctx
  const matter = matterDataPrefix ? (ctx[matterDataPrefix] as UnknownData) : ctx

  // use datasource from matter data if provided
  source = matter.datasource ? (matter.datasource as typeof source) : source

  if (
    typeof source === 'string' ||
    (Array.isArray(source) && isDatasources(source))
  ) {
    ctx.datasources = fg
      .sync(source, { onlyFiles: true })
      .map(p => p.replace(/^\.*?\//g, ''))

    const datasourcesAncestor =
      ctx.datasources.length > 1
        ? String(ancestorPath(...ctx.datasources))
        : dirname(ctx.datasources[0])
    ctx.datasourcesAncestor = datasourcesAncestor.replace(/\\+/g, '/')

    for (const source of ctx.datasources) {
      const notation = source.replace(
        new RegExp(`^${ctx.datasourcesAncestor}/|${extname(source)}$`, 'g'),
        ''
      )

      setValue(ctx, notation, await loadFile(source), {
        separator: '/',
        merge
      })
    }
  } else if (typeof source === 'object') {
    Object.assign(ctx, Array.isArray(source) ? { unknown: source } : source)
  }
}
