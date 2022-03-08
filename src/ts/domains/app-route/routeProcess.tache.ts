import { createArrayMSTache, isVacuo, TERMINATOR, looseCurryN } from '../../libs/mobius-utils'
import { DEFAULT_ROUTE_PROCESS_OPTIONS_COMMON_PRESETS } from './common.tache'
import { Route } from './app-route__route.model'

import type { UndefinedableByKeys, AtomLikeOfOutput } from '../../libs/mobius-utils'
import type { RouteProcessOptionsCommonPresets } from './common.tache'

export interface RouteProcessOptions {
  presets?: RouteProcessOptionsCommonPresets
  filter?: (route: Route) => boolean
  mapper?: (route: Route) => any
  reducer?: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any
}
export const DEFAULT_ROUTE_RECORD_PROCESS_OPTIONS: UndefinedableByKeys<Required<RouteProcessOptions>, 'presets'> = {
  presets: undefined,
  filter: () => true,
  mapper: route => route,
  reducer: (previousValue, currentValue, currentIndex, array) => currentValue
}
/**
 * @see {@link RouteProcessOptions}
 */
export const DEFAULT_ROUTE_RECORD_PROCESS_OPTIONS_PRESETS = {
  ...DEFAULT_ROUTE_PROCESS_OPTIONS_COMMON_PRESETS
}

/**
 *
 */
export const routeProcessT = createArrayMSTache<[RouteProcessOptions, Route], any, true, 'partly', 'left'>({
  acceptNonAtom: true,
  customizeType: 'partly',
  options: { lift: { position: 'left' } },
  sourcesType: 'array',
  autoUpdateContexts: true,
  transformation: (prev, cur, mutation, contexts) => {
    if (isVacuo(prev)) return TERMINATOR
    if (isVacuo(prev.value)) return TERMINATOR

    const {
      states, values, previousRoute, list = [], reduced
    } = contexts
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
        preparedFilter = (route: Route) => {
          const distinctResult = (isDistinct && (previousRoute !== undefined))
            ? Route.distinctByPartialUrl(route, previousRoute)
            : true
          const pathMatchesResult = pathMatches === undefined ? true : Route.pathIncludes(route, pathMatches)
          return distinctResult && pathMatchesResult
        }
      } else {
        preparedFilter = filter
      }
      const filterResult = preparedFilter(values[1]!)
      if (!filterResult) {
        return TERMINATOR
      }
      contexts.previousRoute = values[1]!

      let preparedMapper
      if (presets !== undefined) {
        const { pathIndex, defaultTo } = { ...DEFAULT_ROUTE_RECORD_PROCESS_OPTIONS_PRESETS, ...presets }
        preparedMapper = (route: Route) => {
          const pathIndexResult = pathIndex === undefined ? route : route.value.pathArr[pathIndex]
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

interface IRouteProcessT_ {
  (
    options: RouteProcessOptions | AtomLikeOfOutput<RouteProcessOptions>,
    route: Route | AtomLikeOfOutput<Route>
  ): any
  (
    options: RouteProcessOptions | AtomLikeOfOutput<RouteProcessOptions>
  ): (route: Route | AtomLikeOfOutput<Route>) => any
}
/**
 * @see {@link routeProcessT}
 */
export const routeProcessT_: IRouteProcessT_ = looseCurryN(2, routeProcessT)
