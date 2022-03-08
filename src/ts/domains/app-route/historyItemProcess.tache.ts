import { createArrayMSTache, isVacuo, TERMINATOR, looseCurryN } from '../../libs/mobius-utils'
import { DEFAULT_ROUTE_PROCESS_OPTIONS_COMMON_PRESETS } from './common.tache'

import type { UndefinedableByKeys, AtomLikeOfOutput } from '../../libs/mobius-utils'
import type { AppRouteManagerHistoryItem } from './app-route__app-route-manager.model'
import type { RouteProcessOptionsCommonPresets } from './common.tache'

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
export const historyItemProcessT = createArrayMSTache<[HistoryItemProcessOptions, AppRouteManagerHistoryItem], any, true, 'partly', 'left'>({
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
export const historyItemProcessT_: IHistoryItemProcessT_ = looseCurryN(2, historyItemProcessT)
