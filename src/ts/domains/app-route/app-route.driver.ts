import {
  Data,
  replayWithLatest,
  createGeneralDriver, useGeneralDriver_
} from '../../libs/mobius-utils'
import { Route } from './app-route__route.model'
import { AppRouteManager } from './app-route__app-route-manager.model'
import { routeRecordProcessT, routeRecordProcessT_ } from './routeRecordProcess.tache'
import { historyItemProcessT, historyItemProcessT_ } from './historyItemProcess.tache'
import { routeProcessT, routeProcessT_ } from './routeProcess.tache'

import type {
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

export * from './routeRecordProcess.tache'
export * from './historyItemProcess.tache'
export * from './routeProcess.tache'

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
    routeProcessT: typeof routeProcessT
    routeProcessT_: typeof routeProcessT_
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
    routeProcessT: typeof routeProcessT
    routeProcessT_: typeof routeProcessT_
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
        historyItemProcessT_: historyItemProcessT_,
        routeProcessT: routeProcessT,
        routeProcessT_: routeProcessT_
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
