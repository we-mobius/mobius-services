import {
  isNil, isPlainObject, isObject, isString,
  pathnameToString, pathnameToArray, toSearch, toQueryStr, toQueryObj
} from '../../libs/mobius-utils'

/**
 * @param tar anything
 * @return { boolean } whether the target is a Route instance.
 *
 * @see {@link Route}
 */
export const isRoute = (tar: any): tar is Route => isObject(tar) && tar.isRoute

/**
 * @param tar anything
 * @return { boolean } whether the target is a RouteRecord.
 *
 * @see {@link RouteRecord}
 */
export const isRouteRecord = (tar: any): tar is RouteRecord => isPlainObject(tar) && isString(tar.partialUrl)

/**
 *
 */
const ABSOLUTE_BASE = 'https://url.example.com/'

export interface RouteOptions {
  baseRoute?: Record<string, any>
}

export interface RouteRecord {
  partialUrl: string
  path: string
  search: string
  query: string
  hash: string
  pathStr: string
  pathArr: string[]
  queryStr: string
  queryObj: Record<string, string>
  hashStr: string
  hashObj: Record<string, string>
}
const DEFAULT_ROUTE_RECORD: Required<RouteRecord> = {
  partialUrl: '',
  path: '',
  search: '',
  query: '',
  hash: '',
  pathStr: '',
  pathArr: [],
  queryStr: '',
  queryObj: {},
  hashStr: '',
  hashObj: {}
}

export const DEFAULT_ROUTE_OPTIONS: Required<RouteOptions> = {
  baseRoute: { partialUrl: '/' }
}

/************************************************************************************************
 *
 *                                          Main Route
 *
 ************************************************************************************************/

/**
 *
 */
export class Route {
  _partialUrl: string
  _options: RouteOptions
  _route: RouteRecord

  /**
   * @param partialUrl same as pathname in Url, e.g. '' or '/' or '/path/to/page' or '/path/to/page?question=answer'.
   */
  constructor (partialUrl: string, options: RouteOptions = DEFAULT_ROUTE_OPTIONS) {
    if (!isString(partialUrl)) {
      throw (new TypeError('"partialUrl" is expected to be type of "String".'))
    }
    this._partialUrl = partialUrl
    this._options = { ...DEFAULT_ROUTE_OPTIONS, ...options }
    this._route = DEFAULT_ROUTE_RECORD

    // initialize
    const baseRoute = this._options.baseRoute ?? { partialUrl: '/' }
    const baseUrl = new URL(baseRoute.partialUrl ?? '/', ABSOLUTE_BASE)
    const url = new URL(this._partialUrl, baseUrl)
    this.setUrl(url)

    // setUrl method will correct the partialUrl
    // this.correctPartialUrl()
  }

  get isRoute (): true { return true }

  static of (target: Route | RouteRecord | string, options: RouteOptions = DEFAULT_ROUTE_OPTIONS): Route {
    if (isRoute(target)) {
      return target
    } else if (isPlainObject(target)) {
      return new Route(target.partialUrl, options)
    } else if (isString(target)) {
      return new Route(target, options)
    } else {
      throw (new TypeError('"target" is expected to be type of "String" or "Route".'))
    }
  }

  static empty (options: RouteOptions = DEFAULT_ROUTE_OPTIONS): Route {
    return new Route(DEFAULT_ROUTE_RECORD.partialUrl, options)
  }

  setUrl (url: URL): this {
    // @refer https://developer.mozilla.org/en-US/docs/Web/API/URL
    // Says url: https://url.example.com/path/to/page?question=answer#hello-world
    //   - url.href: https://url.example.com/path/to/page?question=answer#hello-world
    //   - url.origin: https://url.example.com
    //   - url.host: url.example.com
    //   - url.hostname: url.example.com
    //   - url.protocol: https:
    //   - url.pathname: /path/to/page
    //   - url.search: ?question=answer
    //   - url.hash: #hello-world
    const { href, origin, pathname, search, hash } = url
    this._route = {
      ...DEFAULT_ROUTE_RECORD,
      ...this._route
    }
    const partialUrl = href.replace(origin, '')
    this._partialUrl = partialUrl
    this._route.partialUrl = partialUrl

    this.path({ path: pathname })
    this.search({ search })
    this.hash({ hash })

    // path, search, hash method may change the partialUrl
    this.correctPartialUrl()
    return this
  }

  private correctPartialUrl (): this {
    const { path, search, hash } = this._route
    this._partialUrl = `${path}${search}${hash}`
    this._route.partialUrl = this._partialUrl
    return this
  }

  get partialUrl (): string { return this._partialUrl }
  get value (): RouteRecord { return this._route }
  get route (): RouteRecord { return this._route }
  get record (): RouteRecord { return this._route }

  resetQuery (): this {
    this._route.query = DEFAULT_ROUTE_RECORD.query
    this._route.queryStr = DEFAULT_ROUTE_RECORD.queryStr
    this._route.queryObj = DEFAULT_ROUTE_RECORD.queryObj
    this.correctPartialUrl()
    return this
  }

  resetSearch (): this {
    this._route.search = DEFAULT_ROUTE_RECORD.search
    this.correctPartialUrl()
    return this
  }

  resetHash (): this {
    this._route.hash = DEFAULT_ROUTE_RECORD.hash
    this._route.hashStr = DEFAULT_ROUTE_RECORD.hashStr
    this._route.hashObj = DEFAULT_ROUTE_RECORD.hashObj
    this.correctPartialUrl()
    return this
  }

  /**
   * When path is changed, the query and hash will be reset.
   */
  path (options: { path: string }): this {
    const { path } = options

    if (isNil(path)) {
      throw (new TypeError('"path" is required.'))
    }
    if (!isString(path)) {
      throw (new TypeError('"path" is expected to be type of "String".'))
    }

    const prevPath = this._route.pathStr

    this._route.path = path
    this._route.pathStr = pathnameToString(path)
    this._route.pathArr = pathnameToArray(path)

    const postPath = this._route.pathStr

    // when path is changed, reset query and hash
    if (prevPath !== undefined && prevPath !== postPath) {
      this.resetSearch()
      this.resetQuery()
      this.resetHash()
    }

    this.correctPartialUrl()
    return this
  }

  search (options: { search: string }): this {
    const { search } = options

    if (isNil(search)) {
      throw (new TypeError('"search" is required.'))
    }
    if (!isString(search)) {
      throw (new TypeError('"search" is expected to be type of "String".'))
    }

    this._route.search = toSearch(search)

    const query = toQueryStr(search)
    this.query({ query })

    this.correctPartialUrl()
    return this
  }

  query (options: { query: string }): this {
    const { query } = options

    if (isNil(query)) {
      throw (new TypeError('"query" is required.'))
    }
    if (!isString(query)) {
      throw (new TypeError('"query" is expected to be type of "String".'))
    }

    this._route.query = toQueryStr(query)
    this._route.queryStr = toQueryStr(query)
    this._route.queryObj = toQueryObj(query)

    this.correctPartialUrl()
    return this
  }

  hash (options: { hash: string }): this {
    const { hash } = options

    if (isNil(hash)) {
      throw (new TypeError('"hash" is required.'))
    }
    if (!isString(hash)) {
      throw (new TypeError('"hash" is expected to be type of "String".'))
    }

    const hashStr = hash.indexOf('#') === 0 ? hash : `#${hash}`

    this._route.hash = hashStr
    this._route.hashStr = hashStr
    this._route.hashObj = toQueryObj(hash.indexOf('#') === 0 ? hash.substring(1) : hash)

    this.correctPartialUrl()
    return this
  }

  static distinctByPartialUrl (routeA: Route | RouteRecord, routeB: Route | RouteRecord): boolean {
    const routeRecordA = isRoute(routeA) ? routeA.value : routeA
    const routeRecordB = isRoute(routeB) ? routeB.value : routeB
    return routeRecordA.partialUrl !== routeRecordB.partialUrl
  }

  static distinctByPath (routeA: Route | RouteRecord, routeB: Route | RouteRecord): boolean {
    const routeRecordA = isRoute(routeA) ? routeA.value : routeA
    const routeRecordB = isRoute(routeB) ? routeB.value : routeB
    return routeRecordA.pathStr !== routeRecordB.pathStr
  }

  static distinctBySearch (routeA: Route | RouteRecord, routeB: Route | RouteRecord): boolean {
    const routeRecordA = isRoute(routeA) ? routeA.value : routeA
    const routeRecordB = isRoute(routeB) ? routeB.value : routeB
    return routeRecordA.search !== routeRecordB.search
  }

  static distinctByQuery (routeA: Route| RouteRecord, routeB: Route| RouteRecord): boolean {
    const routeRecordA = isRoute(routeA) ? routeA.value : routeA
    const routeRecordB = isRoute(routeB) ? routeB.value : routeB
    return routeRecordA.queryStr !== routeRecordB.queryStr
  }

  static distinctByHash (routeA: Route| RouteRecord, routeB: Route | RouteRecord): boolean {
    const routeRecordA = isRoute(routeA) ? routeA.value : routeA
    const routeRecordB = isRoute(routeB) ? routeB.value : routeB
    return routeRecordA.hashStr !== routeRecordB.hashStr
  }

  isDistinctByPartialUrlFrom (route: Route | RouteRecord): boolean {
    const targetRouteRecord = isRoute(route) ? route.value : route
    return this._route.partialUrl !== targetRouteRecord.partialUrl
  }

  isDistinctByPathFrom (route: Route | RouteRecord): boolean {
    const targetRouteRecord = isRoute(route) ? route.value : route
    return this._route.pathStr !== targetRouteRecord.pathStr
  }

  isDistinctBySearchFrom (route: Route | RouteRecord): boolean {
    const targetRouteRecord = isRoute(route) ? route.value : route
    return this._route.search !== targetRouteRecord.search
  }

  isDistinctByQueryFrom (route: Route | RouteRecord): boolean {
    const targetRouteRecord = isRoute(route) ? route.value : route
    return this._route.queryStr !== targetRouteRecord.queryStr
  }

  isDistinctByHashFrom (route: Route | RouteRecord): boolean {
    const targetRouteRecord = isRoute(route) ? route.value : route
    return this._route.hashStr !== targetRouteRecord.hashStr
  }

  static pathIncludes (route: Route | RouteRecord, path: string | string[]): boolean {
    const routeRecord = isRoute(route) ? route.value : route
    const pieces = isString(path) ? pathnameToArray(path) : path
    return pieces.every(piece => routeRecord.pathArr.includes(piece))
  }

  isPathIncludes (path: string | string[]): boolean {
    const pieces = isString(path) ? pathnameToArray(path) : path
    return pieces.every(piece => this._route.pathArr.includes(piece))
  }
}
