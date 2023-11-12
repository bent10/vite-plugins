/// <reference types="vitest/globals" />

import { frontmatter } from '../src/frontmatter.js'
import type { Context } from '../src/types.js'

let ctx: Context

beforeEach(() => {
  ctx = {} as Context
})

it('should handle frontmatter properly', () => {
  const md = '---\nfoo: bar\nbaz: qux\n---\nSome content'
  const content = frontmatter(ctx, md)

  expect(ctx).toEqual({
    useWith: {},
    matterDataPrefix: false,
    foo: 'bar',
    baz: 'qux'
  })
  expect(content).toBe('Some content')
})

it('should handle frontmatter properly using custom dataPrefix', () => {
  const md = '---\nfoo: bar\nbaz: qux\n---\nSome content'
  const content = frontmatter(ctx, md, { dataPrefix: 'page' })

  expect(ctx).toEqual({
    useWith: {},
    matterDataPrefix: 'page',
    page: { foo: 'bar', baz: 'qux' }
  })
  expect(content).toBe('Some content')
})

it('should use `matter` as dataPrefix when the option set to true', () => {
  const md = '---\nfoo: bar\nbaz: qux\n---\nSome content'
  const content = frontmatter(ctx, md, { dataPrefix: true })

  expect(ctx).toEqual({
    useWith: {},
    matterDataPrefix: 'matter',
    matter: { foo: 'bar', baz: 'qux' }
  })
  expect(content).toBe('Some content')
})

it('should handle markdown without frontmatter', () => {
  const md = 'Some content'
  const content = frontmatter(ctx, md)

  expect(ctx).toEqual({ matterDataPrefix: false, useWith: {} })
  expect(content).toBe('Some content')
})

it('should pass the filename option when available in data', () => {
  const md = '---\nfoo: bar\nfoo: baz\n---\nContent'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx.route = { source: 'test.md' } as any

  expect(() => frontmatter(ctx, md)).toThrow(/duplicated mapping key in/)
  expect(() => frontmatter(ctx, md)).toThrow(/test\.md/)
})

it('should ends `closeTag` with newline', () => {
  const md = '---\nfoo: bar\n------\n'

  expect(() => frontmatter(ctx, md)).toThrow(
    /can not read a block mapping entry/
  )
})
