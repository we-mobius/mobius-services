import {
  looseCurryN,
  isVacuo, TERMINATOR,
  Data,
  replayWithLatest,
  createArrayMSTache,
  createGeneralDriver, useGeneralDriver_
} from '../../libs/mobius-utils'
import { AppRouteManager } from './app-route__app-route-manager.model'

import type {
  ReplayDataMediator,
  DriverOptions, DriverLevelContexts, DriverSingletonLevelContexts, DriverInstance
} from '../../libs/mobius-utils'
import type {
  AppRouteManagerOptions,
  AppRouteManagerRouteOptions, AppRouteManagerNavigateOptions, AppRouteManagerRedirectOptions, AppRouteManagerRefreshOptions,
  AppRouteManagerRoamingOptions, AppRouteManagerForwardOptions, AppRouteManagerBackwardOptions,
  AppRouteManagerQueryOptions, AppRouteManagerHashOptions,
  AppRouteManagerDirectives, AppRouteManagerHistory, AppRouteManagerStack, AppRouteManagerRoamingState
} from './app-route__app-route-manager.model'
import type {
  Route, RouteRecord
} from './app-route__route.model'

export interface AppRouteDriverOptions extends DriverOptions, AppRouteManagerOptions { }
export interface AppRouteDriverSingletonLevelContexts extends DriverSingletonLevelContexts {
  inputs: {
    options: Data<AppRouteDriverOptions>
    route: Data<AppRouteManagerRouteOptions>
    navigate: Data<AppRouteManagerNavigateOptions>
    redirect: Data<AppRouteManagerRedirectOptions>
    refresh: Data<AppRouteManagerRefreshOptions>
    roaming: Data<AppRouteManagerRoamingOptions>
    forward: Data<AppRouteManagerForwardOptions>
    backward: Data<AppRouteManagerBackwardOptions>
    query: Data<AppRouteManagerQueryOptions>
    hash: Data<AppRouteManagerHashOptions>
  }
  outputs: {
    options: ReplayDataMediator<AppRouteDriverOptions>
    directives: ReplayDataMediator<AppRouteManagerDirectives>
    history: ReplayDataMediator<AppRouteManagerHistory>
    stack: ReplayDataMediator<AppRouteManagerStack>
    stackRecord: ReplayDataMediator<RouteRecord[]>
    roamingState: ReplayDataMediator<AppRouteManagerRoamingState>
    currentRoute: ReplayDataMediator<Route>
    currentRouteRecord: ReplayDataMediator<RouteRecord>
  }
}
export interface AppRouteDriverInstance extends DriverInstance {
  inputs: {
    options: Data<AppRouteDriverOptions>
    route: Data<AppRouteManagerRouteOptions>
    navigate: Data<AppRouteManagerNavigateOptions>
    redirect: Data<AppRouteManagerRedirectOptions>
    refresh: Data<AppRouteManagerRefreshOptions>
    roaming: Data<AppRouteManagerRoamingOptions>
    forward: Data<AppRouteManagerForwardOptions>
    backward: Data<AppRouteManagerBackwardOptions>
    query: Data<AppRouteManagerQueryOptions>
    hash: Data<AppRouteManagerHashOptions>
  }
  outputs: {
    options: ReplayDataMediator<AppRouteDriverOptions>
    directives: ReplayDataMediator<AppRouteManagerDirectives>
    history: ReplayDataMediator<AppRouteManagerHistory>
    stack: ReplayDataMediator<AppRouteManagerStack>
    stackRecord: ReplayDataMediator<RouteRecord[]>
    roamingState: ReplayDataMediator<AppRouteManagerRoamingState>
    currentRoute: ReplayDataMediator<Route>
    currentRouteRecord: ReplayDataMediator<RouteRecord>
  }
}

export const makeAppRouteDriver =
createGeneralDriver<AppRouteDriverOptions, DriverLevelContexts, AppRouteDriverSingletonLevelContexts, AppRouteDriverInstance>({
  prepareSingletonLevelContexts: (options, driverLevelContexts) => {
    const optionsInD = Data.empty<AppRouteDriverOptions>()
    const optionsRD = replayWithLatest(1, Data.of<AppRouteDriverOptions>(options))

    const appRouteManager = new AppRouteManager({})

    const routeInD = Data.empty<AppRouteManagerRouteOptions>()
    const navigateInD = Data.empty<AppRouteManagerNavigateOptions>()
    const redirectInD = Data.empty<AppRouteManagerRedirectOptions>()
    const refreshInD = Data.empty<AppRouteManagerRefreshOptions>()
    const roamingInD = Data.empty<AppRouteManagerRoamingOptions>()
    const forwardInD = Data.empty<AppRouteManagerForwardOptions>()
    const backwardInD = Data.empty<AppRouteManagerBackwardOptions>()
    const queryInD = Data.empty<AppRouteManagerQueryOptions>()
    const hashInD = Data.empty<AppRouteManagerHashOptions>()

    const directivesRD = replayWithLatest(1, Data.empty<AppRouteManagerDirectives>())
    const historyRD = replayWithLatest(1, Data.empty<AppRouteManagerHistory>())
    const stackRD = replayWithLatest(1, Data.empty<AppRouteManagerStack>())
    const stackRecordRD = replayWithLatest(1, Data.empty<RouteRecord[]>())
    const roamingStateRD = replayWithLatest(1, Data.empty<AppRouteManagerRoamingState>())
    const currentRouteRD = replayWithLatest(1, Data.empty<Route>())
    const currentRouteRecordRD = replayWithLatest(1, Data.empty<RouteRecord>())

    const emit = (): void => {
      directivesRD.mutate(() => appRouteManager.directives)
      historyRD.mutate(() => appRouteManager.history)
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
        stack: stackRD,
        stackRecord: stackRecordRD,
        roamingState: roamingStateRD,
        currentRoute: currentRouteRD,
        currentRouteRecord: currentRouteRecordRD
      },
      contexts: {
        processT: processT_
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

interface ProcessOptions {
  isDistinct?: boolean
  level?: number
  defaultTo?: string
}
const DEFAULT_PROCESS_OPTIONS: ProcessOptions = {
  isDistinct: true,
  level: undefined,
  defaultTo: undefined
}

/**
 *
 */
const processT = createArrayMSTache<[ProcessOptions, RouteRecord], string, true, 'partly', 'left'>({
  acceptNonAtom: true,
  customizeType: 'partly',
  options: { lift: { position: 'left' } },
  sourcesType: 'array',
  autoUpdateContexts: true,
  transformation: (prev, cur, mutation, contexts) => {
    if (isVacuo(prev)) return TERMINATOR
    if (isVacuo(prev.value)) return TERMINATOR

    const { states, values } = contexts
    const { key } = prev

    if (!states[0] || !states[1]) {
      return TERMINATOR
    }
    if (key === 0) {
      return TERMINATOR
    }
    if (key === 1) {
      const {
        isDistinct, level, defaultTo
      } = { ...DEFAULT_PROCESS_OPTIONS, ...values[0]! }
      const route = values[1]!

      let preparedRoute: string | undefined

      if (level !== undefined) {
        preparedRoute = route.pathArr[level]
      }

      if (preparedRoute === undefined) {
        if (defaultTo !== undefined) {
          preparedRoute = defaultTo
        } else {
          console.error('Route is undefined.')
          return TERMINATOR
        }
      }

      if (isDistinct === true) {
        if (preparedRoute === contexts.prev) {
          return TERMINATOR
        } else {
          contexts.prev = preparedRoute
        }
      }

      return preparedRoute
    }

    throw (new TypeError('Unexpected key!'))
  }
})

/**
 * @see {@link processT}
 */
const processT_ = looseCurryN(2, processT)
