import type { Routes, Route } from './types.js'

/**
 * Creates routes based on the provided sources.
 */
export function createRoutes(sources: string[]) {
  return sources.reduce((routes, source) => {
    const route = createRoute(source)

    routes[route.url] = route

    // add route aliases for '/index' source
    if (route.url.endsWith('/index')) {
      Object.assign(routes, createRouteAlias(route))
    }

    return routes
  }, {} as Routes)
}

/**
 * Creates a route based on a source path.
 */
function createRoute(source: string): Route {
  const stem = source.slice(0, -3)
  const id = `${stem}.html`
  const url = stem.split('/').reduce((acc, segment) => {
    /* c8 ignore next */
    if (segment.indexOf('$') === 0) return `:${segment.slice(1)}`

    return (acc += `/${segment.toLowerCase()}`)
  }, '')

  return { source, stem, id, url, isAlias: false }
}

/**
 * Creates route aliases for the given route.
 */
function createRouteAlias(route: Route): Routes {
  const routes: Routes = {}

  const aliases = [
    route.url.replace(/index$/, ''),
    route.url.replace(/\/index$/, '')
  ]
  aliases.forEach(url => {
    routes[url] = { ...route, isAlias: true }
  })

  return routes
}
