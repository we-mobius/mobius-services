import {
  isString, isObject, isNumber,
  between,
  looseCurryN,
  Data, Mutation,
  replayWithLatest,
  pipeAtom,
  mergeT, pluckT, mapT, withLatestFromT, createArrayMSTache,
  createGeneralDriver, useGeneralDriver
} from '../../libs/mobius-utils.js'

const INITIAL_ROUTES = {
  stack: [''],
  history: [{ prev: '', cur: '', directive: { type: 'navigate', route: '' } }],
  roaming: { stack: [], step: 0 }
}

export const appRouteDriver = createGeneralDriver({
  prepareSingletonLevelContexts: (options, driverLevelContexts) => {
    const {
      pairs = [['/', 'index']], redirects = [], maxHistory = 100, maxStack = 100
    } = options
    const optionsRD = replayWithLatest(1, Data.of({ pairs, redirects, maxHistory, maxStack }))
    // { type: 'navigate', route: path }
    // { type: 'redirect', route: path }
    // { type: 'roaming', step: Number }
    //   -> where path -> 'home' | '/home' | './example' | '../analyze'
    const navigateToD = Data.empty()
    const redirectToD = Data.empty()
    const roamingToD = Data.empty()

    const formattedNavigateToD = Data.empty()
    const formattedRedirectToD = Data.empty()
    const formattedRoamingToD = Data.empty()

    pipeAtom(navigateToD, Mutation.ofLiftLeft(route => {
      if (isString(route)) {
        return { type: 'navigate', route }
      } else if (isObject(route)) {
        return { type: 'navigate', route: route.route || '' }
      } else {
        throw (new TypeError(`"route" is expected to be type of "String" | "Object", but received "${typeof route}".`))
      }
    }), formattedNavigateToD)
    pipeAtom(redirectToD, Mutation.ofLiftLeft(route => {
      if (isString(route)) {
        return { type: 'redirect', route }
      } else if (isObject(route)) {
        return { type: 'redirect', route: route.route || '' }
      } else {
        throw (new TypeError(`"route" is expected to be type of "String" | "Object", but received "${typeof route}".`))
      }
    }), formattedRedirectToD)
    pipeAtom(roamingToD, Mutation.ofLiftLeft(step => {
      if (isNumber(step)) {
        return { type: 'redirect', step }
      } else if (isObject(step)) {
        return { type: 'redirect', step: step.step || 0 }
      } else {
        throw (new TypeError(`"route" is expected to be type of "Number" | "Object", but received "${typeof step}".`))
      }
    }), formattedRoamingToD)

    const routeToD = mergeT(formattedNavigateToD, formattedRedirectToD, formattedRoamingToD)

    // { stack, history: [{ prev, cur, directive }], roaming: { stack, step } }
    const preRoutesD = Data.of(INITIAL_ROUTES)
    const preRoutesToRoutesM = Mutation.ofLiftBoth(([preRoutes, options], routes) => {
      const { maxHistory = 100, maxStack = 100 } = options
      const { stack, history, roaming } = preRoutes

      return { stack: stack.slice(-maxStack), history: history.slice(-maxHistory), roaming }
    })
    const routesD = Data.of(INITIAL_ROUTES)
    pipeAtom(withLatestFromT(optionsRD, preRoutesD), preRoutesToRoutesM, routesD)

    const navigateM = Mutation.ofLiftBoth(([navigateTo, options], { stack, history, ...others }) => {
      const { route } = navigateTo
      const historyItem = { prev: stack[stack.length - 1], cur: route, directive: { ...navigateTo } }

      stack.push(route)
      history.push(historyItem)

      return { stack, history, ...others }
    })
    pipeAtom(withLatestFromT(optionsRD, formattedNavigateToD), navigateM, preRoutesD)
    const redirectM = Mutation.ofLiftBoth(([redirectTo, options], { stack, history, ...others }) => {
      const { route } = redirectTo
      const historyItem = { prev: stack[stack.length - 1], cur: route, directive: { ...redirectTo } }

      // pop then push
      // same as -> stack[stack.length - 1] = route
      stack.pop()
      stack.push(route)
      history.push(historyItem)

      return { stack, history, ...others }
    })
    pipeAtom(withLatestFromT(optionsRD, formattedRedirectToD), redirectM, preRoutesD)
    const roamingM = Mutation.ofLiftBoth(([roamingTo, options], { stack, history, roaming, ...others }) => {
      const { step } = roamingTo
      let { stack: roamingStack, step: roamingStep } = roaming
      const historyItem = { prev: stack[stack.length - 1], cur: undefined, directive: { ...roamingTo } }

      // if the latest route operation is roaming, the isRoaming state is true
      const isRoaming = history[history.length - 1].type === 'roaming'

      if (isRoaming) {
        roamingStep = roamingStep + step
      } else {
        roamingStack = stack
        roamingStep = step
      }
      roamingStep = between(-1, 1 - roamingStack.length, roamingStep)
      stack = roamingStack.slice(0, roamingStep)

      historyItem.cur = stack[stack.length - 1]

      history.push(historyItem)

      return { stack, history, roaming: { stack: roamingStack, step: roamingStep }, ...others }
    })
    pipeAtom(withLatestFromT(optionsRD, formattedRoamingToD), roamingM, preRoutesD)

    const routeRD = routesD.pipe(
      pluckT('history'),
      mapT(history => {
        const { prev, cur } = history[history.length - 1]
        return { from: prev, to: cur }
      }),
      replayWithLatest(1)
    )

    return {
      inputs: {
        navigateTo: navigateToD,
        redirectTo: redirectToD,
        roamingToD: roamingToD,
        routeTo: routeToD
      },
      outputs: {
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
      let route = values[1].to

      if (level !== undefined) {
        route = values[1].to.split('/')[level]
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
