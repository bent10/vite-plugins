import jsyaml from 'js-yaml'
import moo from 'moo'
import { Context, FrontmatterOptions, UnknownData } from './types.js'

// Define a lexer for frontmatter and content.
const lexer = moo.states({
  main: {
    open: { match: /^---\n/, lineBreaks: true, push: 'matter' }
  },
  matter: {
    close: { match: /^---\n/, lineBreaks: true, push: 'end' },
    chunk: /.+/,
    lineBreak: { match: /\n+/, lineBreaks: true }
  },
  end: {
    content: moo.fallback
  }
})

/**
 * Parse frontmatter and content from a Markdown document.
 *
 * @param markdown - The Markdown document to parse.
 * @param options - YAML loading options.
 * @returns An object with frontmatter data and content.
 */
export function frontmatter(
  ctx: Context,
  markdown: string,
  options: FrontmatterOptions = {}
) {
  const { dataPrefix = false, ...yamlOptions } = options

  lexer.reset(markdown)
  let fm = ''
  let content = ''

  for (const token of lexer) {
    switch (token.type) {
      case 'open':
      case 'chunk':
      case 'lineBreak':
        fm += token.value
        break
      case 'content':
        content += token.value
        break
    }
  }

  const { matterDataPrefix = dataPrefix, ...matter } = jsyaml.load(
    fm,
    yamlOptions
  ) as UnknownData

  if (typeof matterDataPrefix === 'boolean') {
    Object.assign(
      ctx,
      matterDataPrefix
        ? { matter, matterDataPrefix: 'matter' }
        : { ...matter, matterDataPrefix }
    )
  } else if (typeof matterDataPrefix === 'string') {
    ctx.matterDataPrefix = matterDataPrefix
    ctx[matterDataPrefix] = matter
  }

  return content
}
