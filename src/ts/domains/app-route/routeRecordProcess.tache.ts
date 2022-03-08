import { createArrayMSTache, isVacuo, TERMINATOR, looseCurryN } from '../../libs/mobius-utils'
import { DEFAULT_ROUTE_PROCESS_OPTIONS_COMMON_PRESETS } from './common.tache'
import { Route } from './app-route__route.model'

import type { UndefinedableByKeys, AtomLikeOfOutput } from '../../libs/mobius-utils'
import type { RouteRecord } from './app-route__route.model'
import type { RouteProcessOptionsCommonPresets } from './common.tache'

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
export const routeRecordProcessT = createArrayMSTache<[RouteRecordProcessOptions, RouteRecord], any, true, 'partly', 'left'>({
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
export const routeRecordProcessT_: IRouteRecordProcessT_ = looseCurryN(2, routeRecordProcessT)
