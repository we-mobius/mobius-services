import {
  isObject, isString, isArray,
  between, pathnameToString, pathnameToArray, toQueryStr, toQueryObj
} from '../../libs/mobius-utils'

const ABSOLUTE_BASE = 'https://url.example.com/'

export class Route {
  /**
   * @param { { bashRoute: {} } } options
   */
  constructor (partialUrl, options = {}) {
    if (!isString(partialUrl)) {
      throw (new TypeError('"rawRoute" is expected to be type of "String".'))
    }
    this._partialUrl = partialUrl
    this._options = options
    // { partialUrl, path, search, query, hash, pathStr, pathArr, queryStr, queryObj, hashStr, hashObj }
    this._route = {}

    this._init()
  }

  _init () {
    // baseRoute 可能为 null，所以不应该使用解构默认值：
    // const { baseRoute = { partialUrl: '/' } } = this._options
    const baseRoute = this._options.baseRoute || { partialUrl: '/' }
    const baseUrl = new URL(baseRoute.partialUrl, ABSOLUTE_BASE)
    const url = new URL(this._partialUrl, baseUrl)
    this.setUrl(url)
  }

  setUrl (url) {
    // @refer: https://developer.mozilla.org/en-US/docs/Web/API/URL
    const { href, origin, pathname, search, hash } = url
    this._route = {
      partialUrl: href.replace(origin, '')
    }
    this.path({ path: pathname })
    this.search({ search })
    this.hash({ hash })
    return this
  }

  get value () {
    return this._route
  }

  get route () {
    return this._route
  }

  resetQuery () {
    this._route.query = ''
    this._route.queryStr = ''
    this._route.queryObj = {}
    return this
  }

  resetSearch () {
    this._route.search = ''
    return this
  }

  resetHash () {
    this._route.hash = ''
    this._route.hashStr = ''
    this._route.hashObj = {}
    return this
  }

  path (options) {
    const { path } = options

    const prevPath = this._route.pathStr

    this._route.path = path
    this._route.pathStr = pathnameToString(path)
    this._route.pathArr = pathnameToArray(path)

    const postPath = this._route.pathStr

    // 当 path 发生变更时，重置 search 和 hash
    if (prevPath !== undefined && prevPath !== postPath) {
      this.resetSearch()
      this.resetQuery()
      this.resetHash()
    }

    return this
  }

  search (options) {
    const { search = '' } = options

    this._route.search = search

    const query = toQueryStr(search)
    this.query(query)

    return this
  }

  query (options) {
    const { query = '' } = options
    this._route.query = query
    this._route.queryStr = toQueryStr(query)
    this._route.queryObj = toQueryObj(query)
    return this
  }

  hash (options) {
    const { hash = '' } = options
    this._route.hash = hash
    const hashStr = hash.indexOf('#') === 0 ? hash.substring(1) : hash

    this._route.hashStr = hashStr
    this._route.hashObj = toQueryObj(hashStr)

    return this
  }
}

export class AppRouteManager {
  constructor (options = {}) {
    this._options = options
    // 所有的路由动作都由“指令”的形式传达给 AppRouteManagerInstance，_directives 用于如实记录所有接收到的指令
    // [{ trace, type, ...options }]
    // 路由指令：type 指最终调用的路由方法，trace 记录了路由指令的调用栈，options 是最终调用的路由方法的参数
    this._directives = []
    // 每条路由指令在执行之后会导致路由发生变化，_history 用于如实记录每条路由指令执行前后的路由状态
    // 路由记录：[{ directive, fromRoute, toRoute }]
    this._history = []
    // 记录有效路由节点，最后一项是当前路由
    // 路由栈：[{ partialUrl, path, search, query, hash, pathStr, pathArr, queryStr, queryObj, hashStr, hashObj }]
    this._stack = []
    // 路由支持 forward、backward、roaming，roamingIndex 记录路由下标
    // 当前路由永远是 stack 中的某一项，roaming 常态是最后一项，当发生 roaming 行为时，可能是其它项，称之为非常态
    // 当在 roaming 非常态下进行 navigate 或者 redirect 或者 refresh 时，roaming 将被重置为常态
    this._roamingState = { roamingIndex: -1, roamingRoute: null }
  }

  get currentRoute () {
    return this._getCurrentRoute()
  }

  get options () {
    return this._options
  }

  get directives () {
    return this._directives
  }

  get history () {
    return this._history
  }

  get stack () {
    return this._stack
  }

  get roamingState () {
    return this._roamingState
  }

  parseRoute (rawRoute, options = {}) {
    const currentRoute = this._getCurrentRoute()
    return new Route(rawRoute, { ...this._options, ...options, baseRoute: currentRoute })
  }

  _getRoamingState () {
    return this._roamingState
  }

  _setRoamingState (step) {
    const roamingIndex = between(0, this._stack.length, this._roamingState.roamingIndex + step)
    this._roamingState.roamingIndex = roamingIndex
    this._roamingState.roamingRoute = this._stack[roamingIndex]
  }

  /**
   * 将 roaming 状态重置，即将当前路由设置为最新的记录
   */
  _resetRoamingState () {
    this._roamingState.roamingIndex = this._stack.length - 1
    this._roamingState.roamingRoute = this._stack[this._stack.length - 1] // same as this._stack.slice(-1)[0]
  }

  _getCurrentRoute () {
    return this._getRoamingState().roamingRoute
  }

  _addRoute (route) {
    const { roamingIndex } = this._roamingState
    this._stack = this._stack.slice(0, roamingIndex + 1)
    this._stack.push(route)
    this._resetRoamingState()
  }

  _replaceCurrentRoute (route) {
    const { roamingIndex } = this._roamingState
    this._stack = this._stack.slice(0, roamingIndex)
    this._stack.push(route)
    this._resetRoamingState()
  }

  _addHistory (history) {
    this._history.push(history)
  }

  _addDirective (directive) {
    this._directives.push(directive)
  }

  _traceRoute (trace, clue) {
    if (trace === undefined) {
      return [clue]
    } else if (isArray(trace)) {
      return [...trace, clue]
    } else {
      throw (new TypeError('"trace" is expected to be type of "Array".'))
    }
  }

  /**
   * 发送给 route 的请求最终会被分发给各个具体的路由方法，
   * 包括 navigate, redirect, refresh, roaming...
   *
   * @param { { type } } options
   */
  route (options) {
    if (options === undefined) {
      throw (new TypeError('"options" param of route method is required.'))
    }
    if (!isObject(options)) {
      throw (new TypeError('"options" param is expected to be type of "Object".'))
    }
    const { type = 'navigate', trace } = options

    if (!isString(type)) {
      throw (new TypeError('"type" field is expected to be type of "String".'))
    }

    const _type = type.toLowerCase()
    const _trace = this._traceRoute(trace, { type: 'route', options })

    if (_type === 'navigate') {
      return this.navigate({ ...options, trace: _trace })
    } else if (_type === 'redirect') {
      return this.redirect({ ...options, trace: _trace })
    } else if (_type === 'roaming') {
      return this.roaming({ ...options, trace: _trace })
    } else if (_type === 'refresh') {
      return this.refresh({ ...options, trace: _trace })
    } else if (_type === 'query') {
      return this.query({ ...options, trace: _trace })
    } else if (_type === 'hash') {
      return this.hash({ ...options, trace: _trace })
    } else {
      throw (new Error('Unrecognize type of route, expected to be one of "navigate" | "redirect" | "roaming".'))
    }
  }

  /**
   * navigate 方法会在栈中推入一条新的记录
   */
  navigate (options) {
    const { route, path, trace } = options
    const _trace = this._traceRoute(trace, { type: 'navigate', options })
    const directive = { ...options, trace: _trace, type: 'navigate' }

    if (route === undefined && path === undefined) {
      throw (new TypeError('One of "route" or "path" is required at least.'))
    }

    const fromRoute = this._getCurrentRoute()
    const toRoute = route || this.parseRoute(path).value

    const historyItem = { directive, fromRoute, toRoute }

    this._addRoute(toRoute)
    this._addHistory(historyItem)
    this._addDirective(directive)

    return historyItem
  }

  /**
   * redirect 方法会移除栈中的当前记录，并推入一条新的记录
   */
  redirect (options) {
    const { route, path, trace } = options
    const _trace = this._traceRoute(trace, { type: 'redirect', options })
    const directive = { ...options, trace: _trace, type: 'redirect' }

    if (route === undefined && path === undefined) {
      throw (new TypeError('One of "route" or "path" is required at least.'))
    }

    const fromRoute = this._getCurrentRoute()
    const toRoute = route || this.parseRoute(path).value

    const historyItem = { directive, fromRoute, toRoute }

    this._replaceCurrentRoute(toRoute)
    this._addHistory(historyItem)
    this._addDirective(directive)

    return historyItem
  }

  /**
   * refresh 会移除栈中的当前记录，并将其重新推入栈中
   */
  refresh (options = {}) {
    const { trace } = options
    const _trace = this._traceRoute(trace, { type: 'refresh', options })
    const directive = { ...options, trace: _trace, type: 'refresh' }

    const fromRoute = this._getCurrentRoute()
    const toRoute = fromRoute

    const historyItem = { directive, fromRoute, toRoute }

    // 是否刷新的时候会重置 stack 呢？如果重置的话，使用 _replaceCurrentRoute
    // 如果不重置的话，不需要对 stack 进行任何操作
    // this._replaceCurrentRoute(toRoute)
    this._addHistory(historyItem)
    this._addDirective(directive)

    return historyItem
  }

  roaming (options) {
    if (!isObject(options)) {
      options = { step: options }
    }
    options.step = parseInt(options.step)

    const { step, trace } = options
    if (Number.isNaN(step)) {
      throw (new TypeError('"step" param is expected to be type of valid Number.'))
    }

    const _trace = this._traceRoute(trace, { type: 'roaming', options })

    if (step === 0) {
      return this.refresh({ trace: _trace })
    } else {
      // exactType 最先，防止覆盖 forward 和 backward 的 exactType
      // type 最后，防止 roaming method 收到错误的 type
      const directive = { ...options, trace: _trace, type: 'roaming' }

      const fromRoute = this._getCurrentRoute()
      this._setRoamingState(step)
      const toRoute = this._getCurrentRoute()

      const historyItem = { directive, fromRoute, toRoute }

      this._addHistory(historyItem)
      this._addDirective(directive)

      return historyItem
    }
  }

  forward (options) {
    if (!isObject(options)) {
      options = { step: options === undefined ? 1 : options }
    }
    options.step = Math.abs(parseInt(options.step))

    const { step, trace } = options
    if (Number.isNaN(step)) {
      throw (new TypeError('"step" param is expected to be type of valid Number.'))
    }

    const _trace = this._traceRoute(trace, { type: 'forward', options })

    return this.roaming({ step, trace: _trace })
  }

  backward (options) {
    if (!isObject(options)) {
      options = { step: options === undefined ? -1 : options }
    }
    options.step = -Math.abs(parseInt(options.step))

    const { step, trace } = options
    if (Number.isNaN(step)) {
      throw (new TypeError('"step" param is expected to be type of valid Number.'))
    }

    const _trace = this._traceRoute(trace, { type: 'backward', options })

    return this.roaming({ step, trace: _trace })
  }

  query (options) {
    if (!isObject(options)) {
      options = { query: options }
    }

    const fromRoute = this._getCurrentRoute()
    const toRoute = this.parseRoute(fromRoute).query(options).value

    const { trace } = options
    const _trace = this._traceRoute(trace, { type: 'query', options })

    return this.navigate({ route: toRoute, trace: _trace })
  }

  hash (options) {
    if (!isObject(options)) {
      options = { hash: options }
    }

    const fromRoute = this._getCurrentRoute()
    const toRoute = this.parseRoute(fromRoute).hash(options).value

    const { trace } = options
    const _trace = this._traceRoute(trace, { type: 'hash', options })

    return this.navigate({ route: toRoute, trace: _trace })
  }
}
