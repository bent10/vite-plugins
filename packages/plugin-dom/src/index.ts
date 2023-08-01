import domSerializer from 'dom-serializer'
import { Parser as HtmlParser, DefaultHandler, DomUtils } from 'htmlparser2'
import type { Plugin } from 'vite'
import type { DomOptions } from './types.js'
import { commentsHandler } from './utils.js'

/**
 * Vite plugin for DOM manipulation and comment injection.
 *
 * @param options - The options for the DOM plugin.
 * @returns Vite plugin configuration object.
 */
export default function pluginDom({
  applyOnMode = ['static'],
  comments,
  handler,
  onComplete,
  ...domHandlerOptions
}: DomOptions = {}): Plugin {
  const hasHandler = typeof handler === 'function'
  const hasCallback = typeof onComplete === 'function'

  let defaultHandler: DefaultHandler
  let parser: HtmlParser

  return {
    name: 'vite:plugin-bootstrap',
    apply(_, { mode }) {
      return typeof applyOnMode === 'boolean'
        ? applyOnMode
        : applyOnMode?.indexOf(mode) !== -1
    },
    buildStart() {
      defaultHandler = new DefaultHandler(
        (error, dom) => {
          if (!hasCallback) return

          Promise.resolve(onComplete.call(DomUtils, dom, error))
        },
        domHandlerOptions,
        element => {
          typeof comments === 'object' && commentsHandler(element, comments)

          if (!hasHandler) return

          Promise.resolve(handler.call(DomUtils, element))
        }
      )
      parser = new HtmlParser(defaultHandler)
    },
    transformIndexHtml(html) {
      parser.parseComplete(html)

      return domSerializer(defaultHandler.dom)
    }
  }
}

export * from './types.js'
export { domHas } from './utils.js'

// exposes domhandler types and APIs
export {
  Comment,
  Text,
  CDATA,
  DataNode,
  Document,
  Element,
  Node,
  NodeWithChildren,
  type AnyNode,
  type ChildNode,
  type ParentNode
} from 'domhandler'
