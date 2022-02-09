import {
  looseCurryN,
  isVacuo, TERMINATOR,
  Data,
  replayWithLatest,
  createArrayMSTache,
  createGeneralDriver, useGeneralDriver_
} from '../../libs/mobius-utils'
import { Route } from './app-route__route.model'
import { AppRouteManager } from './app-route__app-route-manager.model'

import type {
  UndefinedableByKeys,
  AtomLikeOfOutput,
  ReplayDataMediator,
  DriverOptions, DriverLevelContexts, DriverSingletonLevelContexts, DriverInstance
} from '../../libs/mobius-utils'
import type {
  AppRouteManagerOptions,
  AppRouteManagerRouteOptions, AppRouteManagerNavigateOptions, AppRouteManagerRedirectOptions, AppRouteManagerRefreshOptions,
  AppRouteManagerRoamingOptions, AppRouteManagerForwardOptions, AppRouteManagerBackwardOptions,
  AppRouteManagerQueryOptions, AppRouteManagerHashOptions,
  AppRouteManagerDirectives, AppRouteManagerHistoryItem, AppRouteManagerHistory, AppRouteManagerStack, AppRouteManagerRoamingState
} from './app-route__app-route-manager.model'
import type {
  RouteRecord
} from './app-route__route.model'

export interface AppRouteDriverOptions extends DriverOptions, AppRouteManagerOptions { }
export interface AppRouteDriverSingletonLevelContexts extends DriverSingletonLevelContexts {
  inputs: {
    options: Data<AppRouteDriverOptions>
    route: Data<AppRouteManagerRouteOptions>
    navigate: Data<AppRouteManagerNavigateOptions | string>
    redirect: Data<AppRouteManagerRedirectOptions | string>
    refresh: Data<AppRouteManagerRefreshOptions>
    roaming: Data<AppRouteManagerRoamingOptions | number>
    forward: Data<AppRouteManagerForwardOptions | number>
    backward: Data<AppRouteManagerBackwardOptions| number>
    query: Data<AppRouteManagerQueryOptions | string>
    hash: Data<AppRouteManagerHashOptions | string>
  }
  outputs: {
    options: ReplayDataMediator<AppRouteDriverOptions>
    directives: ReplayDataMediator<AppRouteManagerDirectives>
    history: ReplayDataMediator<AppRouteManagerHistory>
    currentHistoryItem: ReplayDataMediator<AppRouteManagerHistoryItem>
    stack: ReplayDataMediator<AppRouteManagerStack>
    stackRecord: ReplayDataMediator<RouteRecord[]>
    roamingState: ReplayDataMediator<AppRouteManagerRoamingState>
    currentRoute: ReplayDataMediator<Route>
    currentRouteRecord: ReplayDataMediator<RouteRecord>
  }
  contexts: {
    routeRecordProcessT: typeof routeRecordProcessT
    routeRecordProcessT_: typeof routeRecordProcessT_
    historyItemProcessT: typeof historyItemProcessT
    historyItemProcessT_: typeof historyItemProcessT_
  }
}
export interface AppRouteDriverInstance extends DriverInstance {
  inputs: {
    options: Data<AppRouteDriverOptions>
    route: Data<AppRouteManagerRouteOptions>
    navigate: Data<AppRouteManagerNavigateOptions | string>
    redirect: Data<AppRouteManagerRedirectOptions | string>
    refresh: Data<AppRouteManagerRefreshOptions>
    roaming: Data<AppRouteManagerRoamingOptions | number>
    forward: Data<AppRouteManagerForwardOptions | number>
    backward: Data<AppRouteManagerBackwardOptions| number>
    query: Data<AppRouteManagerQueryOptions | string>
    hash: Data<AppRouteManagerHashOptions | string>
  }
  outputs: {
    options: ReplayDataMediator<AppRouteDriverOptions>
    directives: ReplayDataMediator<AppRouteManagerDirectives>
    history: ReplayDataMediator<AppRouteManagerHistory>
    currentHistoryItem: ReplayDataMediator<AppRouteManagerHistoryItem>
    stack: ReplayDataMediator<AppRouteManagerStack>
    stackRecord: ReplayDataMediator<RouteRecord[]>
    roamingState: ReplayDataMediator<AppRouteManagerRoamingState>
    currentRoute: ReplayDataMediator<Route>
    currentRouteRecord: ReplayDataMediator<RouteRecord>
  }
  contexts: {
    routeRecordProcessT: typeof routeRecordProcessT
    routeRecordProcessT_: typeof routeRecordProcessT_
    historyItemProcessT: typeof historyItemProcessT
    historyItemProcessT_: typeof historyItemProcessT_
  }
}

export const makeAppRouteDriver =
createGeneralDriver<AppRouteDriverOptions, DriverLevelContexts, AppRouteDriverSingletonLevelContexts, AppRouteDriverInstance>({
  prepareSingletonLevelContexts: (options, driverLevelContexts) => {
    const optionsInD = Data.empty<AppRouteDriverOptions>()
    const optionsRD = replayWithLatest(1, Data.of<AppRouteDriverOptions>(options))

    const appRouteManager = new AppRouteManager({})

    const routeInD = Data.empty<AppRouteManagerRouteOptions>()
    const navigateInD = Data.empty<AppRouteManagerNavigateOptions | string>()
    const redirectInD = Data.empty<AppRouteManagerRedirectOptions | string>()
    const refreshInD = Data.empty<AppRouteManagerRefreshOptions>()
    const roamingInD = Data.empty<AppRouteManagerRoamingOptions | number>()
    const forwardInD = Data.empty<AppRouteManagerForwardOptions | number>()
    const backwardInD = Data.empty<AppRouteManagerBackwardOptions| number>()
    const queryInD = Data.empty<AppRouteManagerQueryOptions | string>()
    const hashInD = Data.empty<AppRouteManagerHashOptions | string>()

    const directivesRD = replayWithLatest(1, Data.empty<AppRouteManagerDirectives>())
    const historyRD = replayWithLatest(1, Data.empty<AppRouteManagerHistory>())
    const currentHistoryItemRD = replayWithLatest(1, Data.empty<AppRouteManagerHistoryItem>())
    const stackRD = replayWithLatest(1, Data.empty<AppRouteManagerStack>())
    const stackRecordRD = replayWithLatest(1, Data.empty<RouteRecord[]>())
    const roamingStateRD = replayWithLatest(1, Data.empty<AppRouteManagerRoamingState>())
    const currentRouteRD = replayWithLatest(1, Data.empty<Route>())
    const currentRouteRecordRD = replayWithLatest(1, Data.empty<RouteRecord>())

    const emit = (): void => {
      directivesRD.mutate(() => appRouteManager.directives)
      historyRD.mutate(() => appRouteManager.history)
      currentHistoryItemRD.mutate(() => appRouteManager.history[appRouteManager.history.length - 1])
      stackRD.mutate(() => appRouteManager.stack)
      stackRecordRD.mutate(() => appRouteManager.stackRecord)
      roamingStateRD.mutate(() => appRouteManager.roamingState)
      currentRouteRD.mutate(() => appRouteManager.currentRoute)
      currentRouteRecordRD.mutate(() => appRouteManager.currentRouteRecord)
    }

    routeInD.subscribeValue(options => {
      appRouteManager.route(options)
      emit()
    })
    navigateInD.subscribeValue(options => {
      appRouteManager.navigate(options)
      emit()
    })
    redirectInD.subscribeValue(options => {
      appRouteManager.redirect(options)
      emit()
    })
    roamingInD.subscribeValue(options => {
      appRouteManager.roaming(options)
      emit()
    })
    refreshInD.subscribeValue(options => {
      appRouteManager.refresh(options)
      emit()
    })
    forwardInD.subscribeValue(options => {
      appRouteManager.forward(options)
      emit()
    })
    backwardInD.subscribeValue(options => {
      appRouteManager.backward(options)
      emit()
    })
    queryInD.subscribeValue(options => {
      appRouteManager.query(options)
      emit()
    })
    hashInD.subscribeValue(options => {
      appRouteManager.hash(options)
      emit()
    })

    return {
      inputs: {
        options: optionsInD,
        route: routeInD,
        navigate: navigateInD,
        redirect: redirectInD,
        refresh: refreshInD,
        roaming: roamingInD,
        forward: forwardInD,
        backward: backwardInD,
        query: queryInD,
        hash: hashInD
      },
      outputs: {
        options: optionsRD,
        directives: directivesRD,
        history: historyRD,
        currentHistoryItem: currentHistoryItemRD,
        stack: stackRD,
        stackRecord: stackRecordRD,
        roamingState: roamingStateRD,
        currentRoute: currentRouteRD,
        currentRouteRecord: currentRouteRecordRD
      },
      contexts: {
        routeRecordProcessT: routeRecordProcessT,
        routeRecordProcessT_: routeRecordProcessT_,
        historyItemProcessT: historyItemProcessT,
        historyItemProcessT_: historyItemProcessT_
      }
    }
  },
  prepareInstance: (options, driverLevelContexts, singletonLevelContexts) => {
    const { inputs, outputs, ...others } = singletonLevelContexts
    return { inputs: { ...singletonLevelContexts.inputs }, outputs: { ...singletonLevelContexts.outputs }, ...others }
  }
})

/**
 * @see {@link makeAppRouteDriver}
 */
export const useAppRouteDriver = useGeneralDriver_(makeAppRouteDriver)

interface RouteProcessOptionsCommonPresets {
  /**
   * [filter] whether the route should be emitted or not when current route is same as the previous.
   *
   * @default true
   */
  isDistinct?: boolean
  /**
   * [filter] When `pathMatches` is given, the route will be emitted only when the route path matches the given conditions.
   *
   * @default undefined
   */
  pathMatches?: string | string[]
  /**
   * [mapper] When specified, the route will emit the path part in given index of the route's pathArr
   * instead of `AppRouetManagerHistoryItem`.
   *
   * @default undefined
   */
  pathIndex?: number
  /**
   * [mapper] When specified, the result will replace with given value if it is `undefined`.
   *
   * @default undefined
   */
  defaultTo?: any
}
const DEFAULT_ROUTE_PROCESS_OPTIONS_COMMON_PRESETS = {
  isDistinct: true,
  pathMatches: undefined,
  pathIndex: undefined,
  defaultTo: undefined
}

export interface RouteRecordProcessOptions {
  presets?: RouteProcessOptionsCommonPresets
  filter?: (routeRecord: RouteRecord) => boolean
  mapper?: (routeRecord: RouteRecord) => any
  reducer?: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any
}
export const DEFAULT_ROUTE_RECORD_PROCESS_OPTIONS: UndefinedableByKeys<Required<RouteRecordProcessOptions>, 'presets'> = {
  presets: undefined,
  filter: () => true,
  mapper: routeRecord => routeRecord,
  reducer: (previousValue, currentValue, currentIndex, array) => currentValue
}
/**
 * @see {@link RouteRecordProcessOptions}
 */
export const DEFAULT_ROUTE_RECORD_PROCESS_OPTIONS_PRESETS = {
  ...DEFAULT_ROUTE_PROCESS_OPTIONS_COMMON_PRESETS
}

/**
 *
 */
const routeRecordProcessT = createArrayMSTache<[RouteRecordProcessOptions, RouteRecord], any, true, 'partly', 'left'>({
  acceptNonAtom: true,
  customizeType: 'partly',
  options: { lift: { position: 'left' } },
  sourcesType: 'array',
  autoUpdateContexts: true,
  transformation: (prev, cur, mutation, contexts) => {
    if (isVacuo(prev)) return TERMINATOR
    if (isVacuo(prev.value)) return TERMINATOR

    const {
      states, values, previousRouteRecord, list = [], reduced
    } = contexts as (typeof contexts & { previousRouteRecord: RouteRecord | undefined, list: any[], reduced: any })
    const { key } = prev

    if (!states[0] || !states[1]) {
      return TERMINATOR
    }
    if (key === 0) {
      return TERMINATOR
    }
    if (key === 1) {
      const { presets, filter, mapper, reducer } = { ...DEFAULT_ROUTE_RECORD_PROCESS_OPTIONS, ...values[0]! }

      let preparedFilter
      if (presets !== undefined) {
        const { isDistinct, pathMatches } = { ...DEFAULT_ROUTE_RECORD_PROCESS_OPTIONS_PRESETS, ...presets }
        preparedFilter = (routeRecord: RouteRecord) => {
          const distinctResult = (isDistinct && (previousRouteRecord !== undefined))
            ? Route.distinctByPartialUrl(routeRecord, previousRouteRecord)
            : true
          const pathMatchesResult = pathMatches === undefined ? true : Route.pathIncludes(routeRecord, pathMatches)
          return distinctResult && pathMatchesResult
        }
      } else {
        preparedFilter = filter
      }
      const filterResult = preparedFilter(values[1]!)
      if (!filterResult) {
        return TERMINATOR
      }
      contexts.previousRouteRecord = values[1]!

      let preparedMapper
      if (presets !== undefined) {
        const { pathIndex, defaultTo } = { ...DEFAULT_ROUTE_RECORD_PROCESS_OPTIONS_PRESETS, ...presets }
        preparedMapper = (routeRecord: RouteRecord) => {
          const pathIndexResult = pathIndex === undefined ? routeRecord : routeRecord.pathArr[pathIndex]
          const defaultToResult = defaultTo === undefined ? pathIndexResult : (pathIndexResult === undefined ? defaultTo : pathIndexResult)
          return defaultToResult
        }
      } else {
        preparedMapper = mapper
      }
      const mapperResult = preparedMapper(values[1]!)

      list.push(mapperResult)

      const reducerResult = reducer(reduced, list[list.length - 1], list.length - 1, list)
      return reducerResult
    }

    throw (new TypeError('Unexpected key!'))
  }
})

interface IRouteRecordProcessT_ {
  (
    options: RouteRecordProcessOptions | AtomLikeOfOutput<RouteRecordProcessOptions>,
    routeRecord: RouteRecord | AtomLikeOfOutput<RouteRecord>
  ): any
  (
    options: RouteRecordProcessOptions | AtomLikeOfOutput<RouteRecordProcessOptions>
  ): (routeRecord: RouteRecord | AtomLikeOfOutput<RouteRecord>) => any
}
/**
 * @see {@link routeRecordProcessT}
 */
const routeRecordProcessT_: IRouteRecordProcessT_ = looseCurryN(2, routeRecordProcessT)

export interface HistoryItemProcessOptions {
  presets?: RouteProcessOptionsCommonPresets
  filter?: (historyItem: AppRouteManagerHistoryItem) => boolean
  mapper?: (historyItem: AppRouteManagerHistoryItem) => any
  reducer?: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any
}
export const DEFAULT_HISTORY_ITEM_PROCESS_OPTIONS: UndefinedableByKeys<Required<HistoryItemProcessOptions>, 'presets'> = {
  presets: undefined,
  filter: () => true,
  mapper: historyItem => historyItem,
  reducer: (previousValue, currentValue, currentIndex, array) => currentValue
}
/**
 * @see {@link HistoryItemProcessOptions}
 */
export const DEFAULT_HISTORY_ITEM_PROCESS_OPTIONS_PRESETS = {
  ...DEFAULT_ROUTE_PROCESS_OPTIONS_COMMON_PRESETS
}

/**
 *
 */
const historyItemProcessT = createArrayMSTache<[HistoryItemProcessOptions, AppRouteManagerHistoryItem], any, true, 'partly', 'left'>({
  acceptNonAtom: true,
  customizeType: 'partly',
  options: { lift: { position: 'left' } },
  sourcesType: 'array',
  transformation: (prev, cur, mutation, contexts) => {
    if (isVacuo(prev)) return TERMINATOR
    if (isVacuo(prev.value)) return TERMINATOR

    const {
      states, values, list = [], reduced
    } = contexts as (typeof contexts & { list: any[], reduced: any })
    const { key } = prev
    if (!states[0] || !states[1]) {
      return TERMINATOR
    }
    if (key === 0) {
      return TERMINATOR
    }
    if (key === 1) {
      const { presets, filter, mapper, reducer } = { ...DEFAULT_HISTORY_ITEM_PROCESS_OPTIONS, ...values[0]! }

      let preparedFilter
      if (presets !== undefined) {
        const { isDistinct, pathMatches } = { ...DEFAULT_HISTORY_ITEM_PROCESS_OPTIONS_PRESETS, ...presets }
        preparedFilter = (historyItem: AppRouteManagerHistoryItem) => {
          const { fromRoute, toRoute } = historyItem
          const distinctResult = isDistinct ? toRoute.isDistinctByPartialUrlFrom(fromRoute) : true
          const pathMatchesResult = pathMatches === undefined ? true : toRoute.isPathIncludes(pathMatches)
          return distinctResult && pathMatchesResult
        }
      } else {
        preparedFilter = filter
      }
      const filterResult = preparedFilter(values[1]!)
      if (!filterResult) {
        return TERMINATOR
      }

      let preparedMapper
      if (presets !== undefined) {
        const { pathIndex, defaultTo } = { ...DEFAULT_HISTORY_ITEM_PROCESS_OPTIONS_PRESETS, ...presets }
        preparedMapper = (historyItem: AppRouteManagerHistoryItem) => {
          const { toRoute } = historyItem
          const pathIndexResult = pathIndex === undefined ? historyItem : toRoute.value.pathArr[pathIndex]
          const defaultToResult = defaultTo === undefined ? pathIndexResult : (pathIndexResult === undefined ? defaultTo : pathIndexResult)
          return defaultToResult
        }
      } else {
        preparedMapper = mapper
      }
      const mapperResult = preparedMapper(values[1]!)

      list.push(mapperResult)

      const reducerResult = reducer(reduced, list[list.length - 1], list.length - 1, list)
      return reducerResult
    }

    throw (new TypeError('Unexpected key!'))
  }
})

interface IHistoryItemProcessT_ {
  (
    options: HistoryItemProcessOptions | AtomLikeOfOutput<HistoryItemProcessOptions>,
    historyItem: AppRouteManagerHistoryItem | AtomLikeOfOutput<AppRouteManagerHistoryItem>
  ): any
  (
    options: HistoryItemProcessOptions | AtomLikeOfOutput<HistoryItemProcessOptions>
  ): (historyItem: AppRouteManagerHistoryItem | AtomLikeOfOutput<AppRouteManagerHistoryItem>) => any
}
/**
 * @see {@link historyItemProcessT}
 */
const historyItemProcessT_: IHistoryItemProcessT_ = looseCurryN(2, historyItemProcessT)
