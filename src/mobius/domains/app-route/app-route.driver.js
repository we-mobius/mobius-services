import {
  Data, Mutation, isAtom,
  replayWithLatest,
  pipeAtom, binaryTweenPipeAtom
} from '../../libs/mobius-utils.js'

export const makeAppRouteDriver = (options = {}) => {
  const {
    start = { type: 'navigate', route: '/home' },
    pairs = [['/', 'index']], redirects = [], maxHistory = 10, maxStack = 10, maxRoutes = 100
  } = options

  // routeInD:   /  ->  /analyze  ->  /index
  // routeOutD:     ->  /         ->  /analyze
  const routeInD = Data.empty()
  const routeInRD = replayWithLatest(1, routeInD)
  if (isAtom(start)) {
    binaryTweenPipeAtom(start, routeInD)
  } else {
    routeInD.triggerValue(start)
  }

  const inToRouteStateM = Mutation.ofLiftBoth((routeIn, routeState) => {
    const { history, stack, routes } = routeState
    history.push(routeIn)

    const { type, route } = routeIn

    if (type === 'navigate') {
      // { type: 'navigate', route: '/index' }
      // { type: 'navigate', route: './index' }
      stack.push(route)
    } else if (type === 'back') {
      // { type: 'back', route: 2 }
      const idx = stack.length - route >= 1 ? stack.length - route - 1 : 0
      stack.push(stack[idx])
    } else if (type === 'redirect') {
      // { type: 'redirect', route: '/index' }
      stack.pop()
      stack.push(route)
    }

    routes.push(stack[stack.length - 1])

    return { history: history.slice(-maxHistory), stack: stack.slice(-maxStack), routes: routes.slice(-maxRoutes) }
  })

  const routeStateD = Data.of({ history: [], stack: [], routes: [] })
  const routeStateToOutM = Mutation.ofLiftBoth((routeState, routeOut) => {
    const { history, routes } = routeState
    return {
      in: routes[routes.length - 1],
      type: history[history.length - 1].type,
      out: routes[routes.length - 2] || ''
    }
  })
  const routeOutD = Data.empty()
  pipeAtom(routeInRD, inToRouteStateM, routeStateD, routeStateToOutM, routeOutD)

  return {
    routeInD: replayWithLatest(1, routeInD),
    routeOutD: replayWithLatest(1, routeOutD)
  }
}
