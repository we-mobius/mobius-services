import { isString, replayWithLatest } from '../../libs/mobius-utils'
import { routeProcessT } from './routeProcess.tache'

import type { Data, ReplayDataMediator } from '../../libs/mobius-utils'
import type { Route } from './app-route__route.model'
import type { RouteProcessOptions } from './routeProcess.tache'

export const selectRoute = <Payload = any>(
  target: Exclude<RouteProcessOptions['presets'], undefined> | string, route: Data<Route<Payload>>
): ReplayDataMediator<Route<Payload>> => {
  if (isString(target)) {
    return replayWithLatest(1, routeProcessT({ presets: { pathMatches: target } }, route))
  } else {
    return replayWithLatest(1, routeProcessT({ presets: target }, route))
  }
}
