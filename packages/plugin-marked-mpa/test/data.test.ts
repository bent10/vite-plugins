/// <reference types="vitest/globals" />

import { retrieveData } from '../src/data.js'
import type { Context } from '../src/types.js'
import posts from './fixtures/posts.json'

const datasources = [
  'test/fixtures/nested.json',
  'test/fixtures/posts.json',
  'test/fixtures/nested/bar.cjs',
  'test/fixtures/nested/foo.yml'
]
let ctx: Context

beforeEach(() => {
  ctx = {} as Context
})

it('should return the original markdown when source is an empty object', async () => {
  await retrieveData(ctx, {}, true)

  expect(ctx).toEqual({})
})

it('should load data from files and attach it to the context', async () => {
  await retrieveData(ctx, './test/fixtures/**/*', true)

  expect(ctx).toEqual({
    datasources,
    posts,
    datasourcesAncestor: 'test/fixtures',
    nested: { foo: { abc: 'baz', qux: true }, bar: { qux: false } }
  })
})

it('should load data from files and attach it to the context without merging', async () => {
  await retrieveData(ctx, './test/fixtures/**/*', false)

  expect(ctx).toEqual({
    datasources,
    posts,
    datasourcesAncestor: 'test/fixtures',
    nested: { foo: { qux: true }, bar: { qux: false } }
  })
})

it('should load data from an object and attach it to the context', async () => {
  const data = { foo: 'bar', baz: true }
  await retrieveData(ctx, data, true)

  expect(ctx).toEqual(data)
})

it('should handle array input as specific sources', async () => {
  await retrieveData(
    ctx,
    ['./test/fixtures/posts.json', './no-exist/file.json'],
    true
  )

  expect(ctx).toEqual({
    posts,
    datasources: ['test/fixtures/posts.json'],
    datasourcesAncestor: 'test/fixtures'
  })
})

it('should handle array input types and attach them as "unknown" key', async () => {
  await retrieveData(ctx, ['foo', 1 as unknown as string], true)

  expect(ctx).toEqual({ unknown: ['foo', 1] })
})

it('should use datasource from matter data if provided', async () => {
  ctx.matterDataPrefix = false
  ctx.datasource = './test/fixtures/posts.json'

  await retrieveData(ctx, './test/fixtures/**/*', true)

  expect(ctx).toEqual({
    posts,
    matterDataPrefix: false,
    datasource: './test/fixtures/posts.json',
    datasources: ['test/fixtures/posts.json'],
    datasourcesAncestor: 'test/fixtures'
  })
})

it('should use datasource from matter data with prefix if provided', async () => {
  ctx.matterDataPrefix = 'matter'
  ctx.matter = { datasource: './test/fixtures/posts.json' }

  await retrieveData(ctx, './test/fixtures/**/*', true)

  expect(ctx).toEqual({
    posts,
    matterDataPrefix: 'matter',
    matter: { datasource: './test/fixtures/posts.json' },
    datasources: ['test/fixtures/posts.json'],
    datasourcesAncestor: 'test/fixtures'
  })
})
