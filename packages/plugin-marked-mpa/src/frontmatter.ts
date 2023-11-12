import jsyaml from 'js-yaml'
import moo from 'moo'
import setValue from 'set-value'
import { Context, FrontmatterOptions, UnknownData } from './types.js'

// Define a lexer for frontmatter and content.
const lexer = moo.states({
  main: {
    open: { match: /^---\n/, lineBreaks: true, push: 'matter' },
    content: moo.fallback
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
  let fm = '---\n'
  let content = ''

  for (const token of lexer) {
    switch (token.type) {
      case 'chunk':
      case 'lineBreak':
        fm += token.value
        break
      case 'content':
        content += token.value
        break
    }
  }

  if (ctx.route && ctx.route.source) {
    Object.assign(yamlOptions, { filename: ctx.route.source })
  }

  const {
    matterDataPrefix = dataPrefix,
    useWith = {},
    ...matter
  } = { ...(<UnknownData>jsyaml.load(fm, yamlOptions)) }

  // move useWith prop to ctx
  Object.assign(ctx, { useWith })

  if (typeof matterDataPrefix === 'boolean') {
    if (matterDataPrefix) {
      ctx.matterDataPrefix = 'matter'
      setValue(ctx, 'matter', matter, { merge: true })
    } else {
      Object.assign(ctx, { ...matter, matterDataPrefix })
    }
  } else if (typeof matterDataPrefix === 'string') {
    ctx.matterDataPrefix = matterDataPrefix
    setValue(ctx, matterDataPrefix, matter, { merge: true })
  }

  return content
}
