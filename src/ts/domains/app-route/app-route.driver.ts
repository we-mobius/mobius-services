import {
  looseCurryN,
  Data,
  replayWithLatest,
  createArrayMSTache,
  createGeneralDriver, useGeneralDriver
} from '../../libs/mobius-utils'
import { AppRouteManager } from './app-route.model'

export const appRouteDriver = createGeneralDriver({
  prepareSingletonLevelContexts: (options, driverLevelContexts) => {
    const optionsInD = Data.empty()
    const optionsRD = replayWithLatest(1, Data.of(options))

    const appRouteManager = new AppRouteManager({})

    const routeInD = Data.empty()
    const navigateInD = Data.empty()
    const redirectInD = Data.empty()
    const roamingInD = Data.empty()
    const refreshInD = Data.empty()
    const forwardInD = Data.empty()
    const backwardInD = Data.empty()
    const queryInD = Data.empty()
    const hashInD = Data.empty()

    const directivesRD = replayWithLatest(1, Data.empty())
    const historyRD = replayWithLatest(1, Data.empty())
    const stackRD = replayWithLatest(1, Data.empty())
    const roamingStateRD = replayWithLatest(1, Data.empty())
    const routeRD = replayWithLatest(1, Data.empty())

    const emit = () => {
      directivesRD.mutate(() => appRouteManager.directives)
      historyRD.mutate(() => appRouteManager.history)
      stackRD.mutate(() => appRouteManager.stack)
      roamingStateRD.mutate(() => appRouteManager.roamingState)
      routeRD.mutate(() => appRouteManager.currentRoute)
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
        roaming: roamingInD,
        refresh: refreshInD,
        forward: forwardInD,
        backward: backwardInD,
        query: queryInD,
        hash: hashInD
      },
      outputs: {
        directives: directivesRD,
        history: historyRD,
        stack: stackRD,
        roamingState: roamingStateRD,
        route: routeRD
      },
      contexts: {
        processT
      }
    }
  },
  prepareInstance: (options, driverLevelContexts, singletonLevelContexts) => {
    const { inputs, outputs, ...others } = singletonLevelContexts
    return { inputs: { ...singletonLevelContexts.inputs }, outputs: { ...singletonLevelContexts.outputs }, ...others }
  }
})

export const useAppRouteDriver = useGeneralDriver(appRouteDriver)

const processT = looseCurryN(2, createArrayMSTache({
  acceptNonAtom: true,
  opCustomizeType: 'partly',
  opLiftType: 'left',
  autoUpdateContexts: true,
  operation: (prev, cur, mutation, contexts) => {
    const { states, values, TERMINATOR } = contexts
    const { id } = prev

    if (!states[0] || !states[1]) {
      return TERMINATOR
    }
    if (id === 0) {
      return TERMINATOR
    }
    if (id === 1) {
      const { isDistinct = true, level = undefined, defaultTo = undefined } = values[0]
      let route = values[1]

      if (level !== undefined) {
        route = values[1].pathArr[level]
      }
      if (route === undefined) {
        if (defaultTo !== undefined) {
          route = defaultTo
        } else {
          console.error('Route is undefined.')
          return TERMINATOR
        }
      }

      if (isDistinct) {
        if (route === contexts.prev) {
          return TERMINATOR
        } else {
          contexts.prev = route
          return route
        }
      } else {
        return route
      }
    }
  }
}))
