import { Comment, Element, Text } from 'domhandler'
import { DomUtils } from 'htmlparser2'
import type { CommentSelectors, Pattern } from './types.js'

/**
 * Checks if an element has a given attribute with the provided pattern.
 *
 * @param elem - The DOM element to check.
 * @param attrName - The attribute name to check for.
 * @param patterns - The patterns to match against the attribute value.
 *                   It can be a string, a regular expression, or an array of strings or regular expressions.
 * @returns `true` if the element has the attribute with the given pattern; otherwise, `false`.
 */
export function domHas(
  elem: Element,
  attrName: string,
  patterns: Pattern | Pattern[]
) {
  return testPatterns(elem.attribs[attrName] || '', patterns)
}

/**
 * Handles adding comments to elements based on the provided selectors.
 *
 * @param elem - The DOM element to handle.
 * @param selectors - The selectors to match against the element.
 */
export function commentsHandler(elem: Element, selectors: CommentSelectors) {
  const { tags = [], ids = [], classes = [] } = selectors
  const tagName = testPatterns(elem.tagName, tags) ? elem.tagName : ''

  // select by id or classname
  if (domHas(elem, 'id', ids) || domHas(elem, 'class', classes)) {
    const prefix = elem.attribs.id ? `${tagName}#` : `${tagName}.`
    const values =
      elem.attribs.id ||
      elem.attribs.class
        .split(' ')
        .filter(cls => testPatterns(cls, classes))
        .join('.')

    DomUtils.prepend(elem, new Text('\n\n'))
    DomUtils.append(elem, new Text('\n\n'))
    DomUtils.prepend(elem, new Comment(`BEGIN ${prefix + values}`))
    DomUtils.append(elem, new Comment(`/END ${prefix + values}`))
  } else {
    if (tagName) {
      DomUtils.prepend(elem, new Text('\n\n'))
      DomUtils.append(elem, new Text('\n\n'))
      DomUtils.prepend(elem, new Comment(`BEGIN ${tagName}`))
      DomUtils.append(elem, new Comment(`/END ${tagName}`))
    }
  }
}

/**
 * Tests if a value matches a given pattern.
 *
 * @param value - The value to test.
 * @param patterns - The patterns to match against the value.
 *                   It can be a string, a regular expression, or an array of strings or regular expressions.
 * @returns `true` if the value matches the pattern; otherwise, `false`.
 */
function testPatterns(value: string, patterns: Pattern | Pattern[]) {
  const values = value.split(' ')

  switch (typeof patterns) {
    case 'string':
      return values.indexOf(patterns) !== -1

    case 'object':
      if (patterns instanceof RegExp)
        return values.some(val => patterns.test(val))

      if (Array.isArray(patterns))
        return patterns.some(pat => {
          if (typeof pat === 'string') return values.indexOf(pat) !== -1
          if (pat instanceof RegExp) return values.some(val => pat.test(val))

          return false
        })

      return false

    default:
      return false
  }
}
