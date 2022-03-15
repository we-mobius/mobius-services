export interface RouteProcessOptionsCommonPresets {
  /**
   * [filter] whether the route should be emitted or not when current route is same as the previous.
   *
   * @default false
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
export const DEFAULT_ROUTE_PROCESS_OPTIONS_COMMON_PRESETS = {
  isDistinct: false,
  pathMatches: undefined,
  pathIndex: undefined,
  defaultTo: undefined
}
