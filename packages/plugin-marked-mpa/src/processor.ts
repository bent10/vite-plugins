import { join, resolve } from 'node:path'
import { Eta } from 'eta'
import { Marked } from 'marked'
import markedHookData from 'marked-hook-data'
import markedHookFrontmatter from 'marked-hook-frontmatter'
import markedHookLayout from 'marked-hook-layout'
import markedSequentialHooks from 'marked-sequential-hooks'
import GithubSlugger from 'github-slugger'
import type { Heading, ProcessorOptions, UnknownData } from './types.js'
import { groupHeadingsByLevel, normalizeDataSource } from './utils.js'

/**
 * Creates a Marked processor with the specified options.
 */
export function createProcessor(
  this: { data: UnknownData },
  options: ProcessorOptions
) {
  const {
    root,
    data: datasource = 'data',
    frontmatter: fmOptions,
    eta: etaOptions = {},
    layouts,
    extensions = []
  } = options
  const resolvedRoot = resolve(root)
  const normalizedDatasource = normalizeDataSource(datasource, resolvedRoot)
  const layoutsDir = join(resolvedRoot, layouts?.dir || 'layouts')

  // template engine
  const eta = new Eta({
    views: resolvedRoot,
    useWith: true,
    tags: ['{{', '}}'],
    ...etaOptions
  })

  // push heading slugger extensions
  const slugger = new GithubSlugger()
  let headingList: Omit<Heading, 'children'>[] = []
  extensions.push({
    renderer: {
      heading(text, level) {
        const id = slugger.slug(text)
        headingList.push({ text, level, id })

        return `<h${level} id="${id}" tabindex='-1'>${text}</h${level}>`
      }
    }
  })

  return new Marked({ async: true })
    .use(
      markedSequentialHooks({
        markdownHooks: [
          markedHookData(normalizedDatasource),
          markedHookFrontmatter(fmOptions),
          // render templates
          async (md, data) => {
            // consumes top-level promised data directly (without await)
            for (const key in data) {
              if (!(data[key] instanceof Promise)) continue
              data[key] = await data[key]
            }
            return await eta.renderStringAsync(md, data)
          }
        ],
        htmlHooks: [
          (html, data) => {
            data.headings = groupHeadingsByLevel(headingList)
            headingList = []
            // shares data
            Object.assign(this.data, data)
            return html
          },
          markedHookLayout({ ...layouts, dir: layoutsDir }),
          // render templates
          async (html, data) => await eta.renderStringAsync(html, data)
        ]
      })
    )
    .use(...extensions)
}
