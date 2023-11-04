import { resolve } from 'node:path'
import { Eta } from 'eta'
import { Marked } from 'marked'
import markedHookData from 'marked-hook-data'
import markedHookFrontmatter from 'marked-hook-frontmatter'
import markedHookLayout from 'marked-hook-layout'
import markedSequentialHooks from 'marked-sequential-hooks'
import GithubSlugger from 'github-slugger'
import type { Context, Heading, ProcessorOptions } from './types.js'
import { groupHeadingsByLevel, normalizeDataSource } from './utils.js'

/**
 * Creates a Marked processor with the specified options.
 */
export function createProcessor(ctx: Context, options: ProcessorOptions) {
  const {
    root,
    data: datasource = 'data',
    frontmatter: fmOptions,
    eta: etaOptions = {},
    layouts: layoutsOptions,
    extensions = []
  } = options

  const resolvedRoot = resolve(root)
  const normalizedDatasource = normalizeDataSource(datasource, resolvedRoot)

  // template engine
  const eta = new Eta({
    views: resolvedRoot,
    useWith: true,
    varName: 'data',
    tags: ['{{', '}}'],
    ...etaOptions
  })

  // push heading slugger extensions
  const slugger = new GithubSlugger()
  let headingList: Omit<Heading, 'children'>[] = []
  extensions.push({
    renderer: {
      heading(text, level) {
        const normalizedText = text.trim().replace(/<[!\/a-zA-Z].*?>/g, '')
        const id = slugger.slug(normalizedText)

        headingList.push({ text: normalizedText, level, id })

        return `<h${level} id="${id}" tabindex='-1'>${text}</h${level}>\n`
      }
    }
  })

  return new Marked({ async: true })
    .use(
      markedSequentialHooks({
        markdownHooks: [
          (md, data) => {
            Object.assign(data, ctx)
            return md
          },
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
            return html
          },
          markedHookLayout(layoutsOptions),
          // render templates
          async (html, data) => await eta.renderStringAsync(html, data)
        ]
      })
    )
    .use(...extensions)
}
