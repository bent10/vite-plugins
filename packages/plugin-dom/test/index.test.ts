import type { ConfigEnv, IndexHtmlTransformResult } from 'vite'
import pluginDom, { domHas, Element } from '../src/index.js'

describe('pluginDom', () => {
  describe('apply', () => {
    it('applies the plugin on all modes when applyOnMode is true', () => {
      const convigEnv: ConfigEnv = { command: 'build', mode: 'static' }
      const plugin = pluginDom({ applyOnMode: true })

      if (typeof plugin.apply === 'function')
        expect(plugin.apply?.({}, convigEnv)).toBe(true)
    })

    it('applies the plugin on specific modes when applyOnMode is an array', () => {
      const plugin = pluginDom({ applyOnMode: ['static', 'development'] })

      if (typeof plugin.apply === 'function') {
        expect(plugin.apply?.({}, { command: 'build', mode: 'static' })).toBe(
          true
        )
        expect(
          plugin.apply?.({}, { command: 'build', mode: 'development' })
        ).toBe(true)
        expect(
          plugin.apply?.({}, { command: 'build', mode: 'production' })
        ).toBe(false)
      }
    })
  })

  describe('handler', () => {
    it('calls handler callback', () => {
      const handler = vi.fn()
      const plugin = pluginDom({ handler })

      const buildStart = plugin.buildStart as () => void
      const transformIndexHtml = plugin.transformIndexHtml as (
        html: string
      ) => IndexHtmlTransformResult

      buildStart()
      transformIndexHtml('<hr />')

      expect(handler).toHaveBeenCalledOnce()
    })
  })

  describe('transformIndexHtml', () => {
    it('injects comments based on provided selectors', () => {
      const testHtml = `
        <h1></h1>
        <div class="foo"></div>
        <p class="bar"></p>
        <div id="baz"></div>
        <div class="qux"></div>
      `

      const plugin = pluginDom({
        comments: {
          tags: [/^h[1-6]$/, 'div'],
          classes: ['foo', 'bar', /qux/],
          ids: ['baz']
        }
      })

      const buildStart = plugin.buildStart as () => void
      const transformIndexHtml = plugin.transformIndexHtml as (
        html: string
      ) => IndexHtmlTransformResult

      buildStart()
      expect(transformIndexHtml(testHtml)).toMatchSnapshot()
    })

    it('calls onComplete callback after transformation', () => {
      const onComplete = vi.fn((dom, error) => {
        if (error) {
          throw error
        }
        expect(dom.length).toBe(1)
      })
      const plugin = pluginDom({ onComplete })
      const testHtml = '<div>Test HTML</div>'

      const buildStart = plugin.buildStart as () => void
      const transformIndexHtml = plugin.transformIndexHtml as (
        html: string
      ) => IndexHtmlTransformResult

      buildStart()
      transformIndexHtml(testHtml)

      expect(onComplete).toHaveBeenCalledOnce()
    })
  })
})

describe('domHas', () => {
  it('correctly checks for attribute presence with a specific value', () => {
    const elem = {
      tagName: 'div',
      attribs: {
        id: 'elementId',
        class: 'class1 class2 class3'
      }
    } as unknown as Element

    expect(domHas(elem, 'id', 'elementId')).toBe(true)
  })

  it('correctly checks for attribute presence with a regular expression pattern', () => {
    const elem = {
      tagName: 'div',
      attribs: {
        id: 'elementId',
        class: 'class1 class2 class3'
      }
    } as unknown as Element

    expect(domHas(elem, 'class', /class\d+/)).toBe(true)
  })

  it('correctly checks for attribute presence with an array of string patterns', () => {
    const elem = {
      tagName: 'div',
      attribs: {
        id: 'elementId',
        class: 'class1 class2 class3'
      }
    } as unknown as Element

    expect(domHas(elem, 'class', ['class1', 'class4'])).toBe(true)
  })

  it('correctly checks for attribute presence with an array of regular expression patterns', () => {
    const elem = {
      tagName: 'div',
      attribs: {
        id: 'elementId',
        class: 'class1 class2 class3'
      }
    } as unknown as Element

    expect(domHas(elem, 'class', [/class\d+/, /class\d+/])).toBe(true)
  })

  it('returns false when the attribute is not present', () => {
    const elem = {
      tagName: 'div',
      attribs: {
        class: 'class1 class2 class3'
      }
    } as unknown as Element

    expect(domHas(elem, 'id', 'elementId')).toBe(false)
  })

  it('returns false for unsupported type', () => {
    const elem = {
      tagName: 'div',
      attribs: {
        id: 'foo'
      }
    } as unknown as Element

    expect(domHas(elem, 'id', 1 as never)).toBe(false)
    expect(domHas(elem, 'id', {} as never)).toBe(false)
    expect(domHas(elem, 'id', [1] as never)).toBe(false)
  })
})
