import { readFile } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { Eta } from 'eta'
import GithubSlugger from 'github-slugger'
import { Marked } from 'marked'
import { normalizePath } from 'vite'
import { groupHeadingsByLevel } from './utils.js'
import type {
  Context,
  Heading,
  MarkedContext,
  ProcessorOptions
} from './types.js'

/**
 * Creates a Marked processor with the specified options.
 */
export function createProcessor(ctx: Context, options: ProcessorOptions) {
  const { root, layouts, partials, eta: etaOptions, extensions = [] } = options
  let slugger: GithubSlugger
  let headingList: Omit<Heading, 'children'>[] = []

  // template engine
  const eta = new Eta({
    views: resolve(root, partials),
    useWith: true,
    varName: 'data',
    tags: ['{{', '}}'],
    ...etaOptions
  })

  return new Marked({ async: true }).use(...extensions, {
    hooks: {
      async preprocess(md) {
        slugger = new GithubSlugger()
        headingList = []
        ctx.headings = []

        const matter = (
          ctx.matterDataPrefix ? ctx[ctx.matterDataPrefix] : ctx
        ) as MarkedContext
        const baseLayout =
          typeof matter.layout === 'string' ? matter.layout : 'default.html'
        const layout = extname(baseLayout) ? baseLayout : baseLayout + '.html'
        const layoutId = normalizePath(join(layouts, layout))

        // sets layout path
        ctx.layout = {
          id: layoutId,
          raw: await readFile(resolve(root, layoutId), 'utf8')
        }

        return await eta.renderStringAsync(md.replace(/\\{/g, '&#123;'), ctx)
      },
      async postprocess(content) {
        ctx.headings = groupHeadingsByLevel(headingList)

        const layout = await eta.renderStringAsync(ctx.layout.raw, ctx)
        const html = layout.replace(/<Outlet[ \t]*?\/>/, content)

        return html
      }
    },
    // escape template syntax
    async walkTokens(token) {
      if (
        token.type === 'escape' ||
        token.type === 'codespan' ||
        token.type === 'code'
      ) {
        token.text = token.text.replace(/&(?:amp;)?#123;/g, '{')
      }
    },
    renderer: {
      // apply heading id
      heading(text, level) {
        const normalizedText = text.trim().replace(/<[!\/a-zA-Z].*?>/g, '')
        const id = slugger.slug(normalizedText)

        headingList.push({ text: normalizedText, level, id })

        return `<h${level} id="${id}" tabindex='-1'>${text}</h${level}>\n`
      }
    }
  })
}
