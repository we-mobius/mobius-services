import {
  isNil, isPlainObject, isObject, isString, isNumber, isArray,
  between
} from '../../libs/mobius-utils'
import {
  DEFAULT_ROUTE_OPTIONS, Route
} from './app-route__route.model'

import type {
  RouteOptions, RouteRecord
} from './app-route__route.model'

/************************************************************************************************
 *
 *                                     Predicates
 *
 ************************************************************************************************/

/**
 * @param tar anything
 * @return { boolean } whether the target is a AppRouteManager instance
 *
 * @see {@link AppRouteManager}
 */
export const isAppRouteManager = (tar: any): tar is AppRouteManager => isObject(tar) && tar.isAppRouteManager

/************************************************************************************************
 *
 *                                     Types of App Route Manager
 *
 ************************************************************************************************/

/**
 *
 */
export interface AppRouteManagerOptions extends RouteOptions {}

const DEFAULT_APP_ROUTE_MANAGER_OPTIONS: Required<AppRouteManagerOptions> = {
  ...DEFAULT_ROUTE_OPTIONS
}

export enum AppRouteType {
  route = 'route',
  navigate = 'navigate',
  redirect = 'redirect',
  refresh = 'refresh',
  roaming = 'roaming',
  forward = 'forward',
  backward = 'backward',
  query = 'query',
  hash = 'hash'
}

export type AppRouteManagerRouteOptions = AppRouteManagerRouteOptionsUnion & { type: AppRouteType }
export interface AppRouteManagerNavigateOptions {
  type?: AppRouteType.navigate
  trace?: AppRouteManagerRouteTrace
  route?: Route | RouteRecord
  path?: string
}
export interface AppRouteManagerRedirectOptions {
  type?: AppRouteType.redirect
  trace?: AppRouteManagerRouteTrace
  route?: Route | RouteRecord
  path?: string
}
export interface AppRouteManagerRefreshOptions {
  type?: AppRouteType.refresh
  trace?: AppRouteManagerRouteTrace
}
export interface AppRouteManagerRoamingOptions {
  type?: AppRouteType.roaming
  trace?: AppRouteManagerRouteTrace
  step: number
}
export interface AppRouteManagerForwardOptions {
  type?: AppRouteType.forward
  trace?: AppRouteManagerRouteTrace
  step: number
}
export interface AppRouteManagerBackwardOptions {
  type?: AppRouteType.backward
  trace?: AppRouteManagerRouteTrace
  step: number
}
export interface AppRouteManagerQueryOptions {
  type?: AppRouteType.query
  trace?: AppRouteManagerRouteTrace
  query: string
}
export interface AppRouteManagerHashOptions {
  type?: AppRouteType.hash
  trace?: AppRouteManagerRouteTrace
  hash: string
}
type AppRouteManagerRouteOptionsUnion
  = AppRouteManagerNavigateOptions
  | AppRouteManagerRedirectOptions
  | AppRouteManagerRefreshOptions
  | AppRouteManagerRoamingOptions
  | AppRouteManagerForwardOptions
  | AppRouteManagerBackwardOptions
  | AppRouteManagerQueryOptions
  | AppRouteManagerHashOptions

interface AppRouteManagerRouteTraceClue {
  type: AppRouteType
  options: AppRouteManagerRouteOptionsUnion
}
type AppRouteManagerRouteTrace = AppRouteManagerRouteTraceClue[]

type AppRouteManagerDirective = Omit<AppRouteManagerRouteOptionsUnion, 'type'> & { type: AppRouteType, trace: AppRouteManagerRouteTrace }
export type AppRouteManagerDirectives = AppRouteManagerDirective[]

interface AppRouteManagerHistoryRecord {
  directive: AppRouteManagerDirective
  fromRoute: Route
  toRoute: Route
}
export type AppRouteManagerHistory = AppRouteManagerHistoryRecord[]

export type AppRouteManagerStack = Route[]

export interface AppRouteManagerRoamingState {
  roamingIndex: number
  roamingRoute: Route
}

/************************************************************************************************
 *
 *                                      Main App Route Manager
 *
 ************************************************************************************************/

/**
  *
  */
export class AppRouteManager {
  _options: AppRouteManagerOptions
  _directives: AppRouteManagerDirectives
  _history: AppRouteManagerHistory
  _stack: AppRouteManagerStack
  _roamingState: AppRouteManagerRoamingState

  constructor (options: AppRouteManagerOptions = DEFAULT_APP_ROUTE_MANAGER_OPTIONS) {
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
    this._roamingState = { roamingIndex: -1, roamingRoute: Route.empty() }
  }

  get isAppRouteManager (): true { return true }

  get currentRoute (): Route { return this._getCurrentRoute() }
  get currentRouteRecord (): RouteRecord { return this._getCurrentRoute().record }
  get options (): AppRouteManagerOptions { return this._options }
  get directives (): AppRouteManagerDirectives { return this._directives }
  get history (): AppRouteManagerHistory { return this._history }
  get stack (): AppRouteManagerStack { return this._stack }
  get stackRecord (): RouteRecord[] { return this._stack.map(route => route.record) }
  get roamingState (): AppRouteManagerRoamingState { return this._roamingState }

  parseRoute (target: Route | RouteRecord | string, options: RouteOptions = DEFAULT_ROUTE_OPTIONS): Route {
    const currentRoute = this._getCurrentRoute()
    return Route.of(target, { ...this._options, ...options, baseRoute: currentRoute })
  }

  private _getRoamingState (): AppRouteManagerRoamingState { return this._roamingState }

  private _setRoamingState (step: number): this {
    const roamingIndex = between(0, this._stack.length, this._roamingState.roamingIndex + step)
    this._roamingState.roamingIndex = roamingIndex
    this._roamingState.roamingRoute = this._stack[roamingIndex]

    return this
  }

  /**
    * 将 roaming 状态重置，即将当前路由设置为最新的记录
    */
  private _resetRoamingState (): this {
    this._roamingState.roamingIndex = this._stack.length - 1
    this._roamingState.roamingRoute = this._stack[this._stack.length - 1] // same as this._stack.slice(-1)[0]

    return this
  }

  private _getCurrentRoute (): Route { return this._getRoamingState().roamingRoute }

  private _addRoute (route: Route): this {
    const { roamingIndex } = this._roamingState
    this._stack = this._stack.slice(0, roamingIndex + 1)
    this._stack.push(route)
    this._resetRoamingState()

    return this
  }

  private _replaceCurrentRoute (route: Route): this {
    const { roamingIndex } = this._roamingState
    this._stack = this._stack.slice(0, roamingIndex)
    this._stack.push(route)
    this._resetRoamingState()

    return this
  }

  private _addHistory (history: AppRouteManagerHistoryRecord): this {
    this._history.push(history)

    return this
  }

  private _addDirective (directive: AppRouteManagerDirective): this {
    this._directives.push(directive)

    return this
  }

  private _traceRoute (trace: AppRouteManagerRouteTrace | undefined, clue: AppRouteManagerRouteTraceClue): AppRouteManagerRouteTrace {
    if (trace === undefined) {
      return [clue]
    } else if (isArray<AppRouteManagerRouteTraceClue>(trace)) {
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
  route (options: AppRouteManagerRouteOptions): this {
    if (isNil(options)) {
      throw (new TypeError('"options" is required.'))
    }
    if (!isPlainObject(options)) {
      throw (new TypeError('"options" is expected to be type of "PlainObject".'))
    }
    const { type, trace } = options

    if (isNil(type)) {
      throw (new TypeError('"type" is required.'))
    }
    if (!(type in AppRouteType)) {
      throw (new TypeError('"type" is expected to be type of "AppRouteType".'))
    }

    const newTrace = this._traceRoute(trace, { type: AppRouteType.route, options })

    if (type === AppRouteType.navigate) {
      return this.navigate({ ...options, trace: newTrace })
    } else if (type === AppRouteType.redirect) {
      return this.redirect({ ...options, trace: newTrace })
    } else if (type === AppRouteType.refresh) {
      return this.refresh({ ...options, trace: newTrace })
    } else if (type === AppRouteType.roaming) {
      return this.roaming({ ...options, trace: newTrace })
    } else if (type === AppRouteType.forward) {
      return this.forward({ ...options, trace: newTrace })
    } else if (type === AppRouteType.backward) {
      return this.backward({ ...options, trace: newTrace })
    } else if (type === AppRouteType.query) {
      return this.query({ ...options, trace: newTrace })
    } else if (type === AppRouteType.hash) {
      return this.hash({ ...options, trace: newTrace })
    } else {
      throw (new Error('Unrecognize type of route, expected to be one of "AppRouteType" except "route".'))
    }
  }

  /**
    * navigate 方法会在栈中推入一条新的记录
    */
  navigate (options: AppRouteManagerNavigateOptions): this {
    const { route, path, trace } = options
    const newTrace = this._traceRoute(trace, { type: AppRouteType.navigate, options })
    const directive = { ...options, trace: newTrace, type: AppRouteType.navigate }

    if (route === undefined && path === undefined) {
      throw (new TypeError('One of "route" or "path" is required at least.'))
    }

    const fromRoute = this._getCurrentRoute()
    const toRoute = this.parseRoute(route ?? path!)

    const historyItem = { directive, fromRoute, toRoute }

    this._addRoute(toRoute)
    this._addHistory(historyItem)
    this._addDirective(directive)

    return this
  }

  /**
    * redirect 方法会移除栈中的当前记录，并推入一条新的记录
    */
  redirect (options: AppRouteManagerRedirectOptions): this {
    const { route, path, trace } = options
    const newTrace = this._traceRoute(trace, { type: AppRouteType.redirect, options })
    const directive = { ...options, trace: newTrace, type: AppRouteType.redirect }

    if (route === undefined && path === undefined) {
      throw (new TypeError('One of "route" or "path" is required at least.'))
    }

    const fromRoute = this._getCurrentRoute()
    const toRoute = this.parseRoute(route ?? path!)

    const historyItem = { directive, fromRoute, toRoute }

    this._replaceCurrentRoute(toRoute)
    this._addHistory(historyItem)
    this._addDirective(directive)

    return this
  }

  /**
    * refresh 会移除栈中的当前记录，并将其重新推入栈中
    */
  refresh (options: AppRouteManagerRefreshOptions): this {
    const { trace } = options
    const newTrace = this._traceRoute(trace, { type: AppRouteType.refresh, options })
    const directive = { ...options, trace: newTrace, type: AppRouteType.refresh }

    const fromRoute = this._getCurrentRoute()
    const toRoute = fromRoute

    const historyItem = { directive, fromRoute, toRoute }

    // 是否刷新的时候会重置 stack 呢？如果重置的话，使用 _replaceCurrentRoute
    // 如果不重置的话，不需要对 stack 进行任何操作
    // this._replaceCurrentRoute(toRoute)
    this._addHistory(historyItem)
    this._addDirective(directive)

    return this
  }

  roaming (options: AppRouteManagerRoamingOptions | number): this {
    let preparedOptions: AppRouteManagerRoamingOptions
    if (isPlainObject(options)) {
      preparedOptions = options
    } else if (isNumber(options)) {
      preparedOptions = { step: options }
    } else {
      throw (new TypeError('"options" is expected to be type of "PlainObject" or "Number".'))
    }
    preparedOptions.step = parseInt(String(preparedOptions.step))
    if (Number.isNaN(preparedOptions.step)) {
      throw (new TypeError('"step" is expected to be type of valid Number.'))
    }

    const { step, trace } = preparedOptions

    const newTrace = this._traceRoute(trace, { type: AppRouteType.roaming, options: preparedOptions })

    if (step === 0) {
      return this.refresh({ trace: newTrace })
    } else {
      // exactType 最先，防止覆盖 forward 和 backward 的 exactType
      // type 最后，防止 roaming method 收到错误的 type
      const directive = { ...preparedOptions, trace: newTrace, type: AppRouteType.roaming }

      const fromRoute = this._getCurrentRoute()
      this._setRoamingState(step)
      const toRoute = this._getCurrentRoute()

      const historyItem = { directive, fromRoute, toRoute }

      this._addHistory(historyItem)
      this._addDirective(directive)

      return this
    }
  }

  forward (options: AppRouteManagerForwardOptions | number | undefined | null): this {
    let preparedOptions: AppRouteManagerForwardOptions
    if (isNil(options)) {
      preparedOptions = { step: 1 }
    } else if (isNumber(options)) {
      preparedOptions = { step: options }
    } else if (isPlainObject(options)) {
      preparedOptions = options
    } else {
      throw (new TypeError('"options" is expected to be type of "PlainObject" or "Number", or "Nil".'))
    }
    preparedOptions.step = Math.abs(parseInt(String(preparedOptions.step)))
    if (Number.isNaN(preparedOptions.step)) {
      throw (new TypeError('"step" param is expected to be type of valid Number.'))
    }

    const { step, trace } = preparedOptions

    const newTrace = this._traceRoute(trace, { type: AppRouteType.forward, options: preparedOptions })

    return this.roaming({ step, trace: newTrace })
  }

  backward (options: AppRouteManagerBackwardOptions | number | undefined | null): this {
    let preparedOptions: AppRouteManagerBackwardOptions
    if (isNil(options)) {
      preparedOptions = { step: -1 }
    } else if (isNumber(options)) {
      preparedOptions = { step: options }
    } else if (isPlainObject(options)) {
      preparedOptions = options
    } else {
      throw (new TypeError('"options" is expected to be type of "PlainObject" or "Number", or "Nil".'))
    }
    preparedOptions.step = -Math.abs(parseInt(String(preparedOptions.step)))
    if (Number.isNaN(preparedOptions.step)) {
      throw (new TypeError('"step" param is expected to be type of valid Number.'))
    }

    const { step, trace } = preparedOptions

    const newTrace = this._traceRoute(trace, { type: AppRouteType.backward, options: preparedOptions })

    return this.roaming({ step, trace: newTrace })
  }

  query (options: AppRouteManagerQueryOptions | string | undefined | null): this {
    let preparedOptions: AppRouteManagerQueryOptions
    if (isNil(options)) {
      preparedOptions = { query: '' }
    } else if (isString(options)) {
      preparedOptions = { query: options }
    } else if (isPlainObject(options)) {
      preparedOptions = options
    } else {
      throw (new TypeError('"options" is expected to be type of "PlainObject" or "String", or "Nil".'))
    }

    const fromRoute = this._getCurrentRoute()
    const toRoute = this.parseRoute(fromRoute).query(preparedOptions)

    const { trace } = preparedOptions
    const newTrace = this._traceRoute(trace, { type: AppRouteType.query, options: preparedOptions })

    return this.navigate({ route: toRoute, trace: newTrace })
  }

  hash (options: AppRouteManagerHashOptions | string | undefined | null): this {
    let preparedOptions: AppRouteManagerHashOptions
    if (isNil(options)) {
      preparedOptions = { hash: '' }
    } else if (isString(options)) {
      preparedOptions = { hash: options }
    } else if (isPlainObject(options)) {
      preparedOptions = options
    } else {
      throw (new TypeError('"options" is expected to be type of "PlainObject" or "String", or "Nil".'))
    }

    const fromRoute = this._getCurrentRoute()
    const toRoute = this.parseRoute(fromRoute).hash(preparedOptions)

    const { trace } = preparedOptions
    const newTrace = this._traceRoute(trace, { type: AppRouteType.hash, options: preparedOptions })

    return this.navigate({ route: toRoute, trace: newTrace })
  }
}
