import { readFile } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
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
  const { root, layouts, eta, extensions = [] } = options
  const slugger = new GithubSlugger()
  const headingList: Omit<Heading, 'children'>[] = []

  return new Marked({ async: true }).use(...extensions, {
    hooks: {
      async preprocess(md: string) {
        Object.assign(this, { data: ctx })

        slugger.reset()
        headingList.length = 0
        ctx.headings = []

        const matter = (
          ctx.matterDataPrefix ? ctx[ctx.matterDataPrefix] : ctx
        ) as MarkedContext

        // special matter prop (layout)
        const baseLayout =
          typeof matter.layout === 'string' ? matter.layout : 'default.html'
        const layoutSource = extname(baseLayout)
          ? baseLayout
          : baseLayout + '.html'
        const layoutId = normalizePath(join(layouts, layoutSource))

        // sets layout path
        ctx.layout = {
          id: layoutId,
          raw: await readFile(resolve(root, layoutId), 'utf8')
        }

        return await eta.renderStringAsync(md.replace(/\\</g, '&lt;'), ctx)
      },
      async postprocess(content: string) {
        ctx.headings = groupHeadingsByLevel(headingList)

        const layout = await eta.renderStringAsync(ctx.layout.raw, ctx)
        const html = layout.replace(/<Outlet[ \t]*?\/>/, content)

        return html
      }
    },
    // escape template syntax
    async walkTokens(token) {
      if (token.type === 'codespan') {
        token.text = token.text.replace(/&amp;lt;/g, '&lt;')
      } else if (token.type === 'code') {
        token.text = token.text.replace(/&lt;/g, '<')
      }
    },
    renderer: {
      // apply heading id
      heading({ depth, tokens }) {
        const text = this.parser.parseInline(tokens)
        const normalizedText = text.trim().replace(/<[^>]*\/?>|<\/[^>]*>/g, '')

        const id = slugger.slug(normalizedText)

        headingList.push({ text: normalizedText, level: depth, id })

        return `<h${depth} id="${id}" tabindex='-1'>${text}</h${depth}>\n`
      }
    }
  })
}
