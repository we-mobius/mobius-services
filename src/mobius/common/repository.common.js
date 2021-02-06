import { Subject, shareReplay } from '../libs/rx.js'
import { isObject, isFunction } from '../libs/mobius-utils.js'

export const makeBaseObserver = config => {
  let next = () => {}
  let error = () => {}
  let complete = () => {}

  if (isFunction(config)) {
    next = config
  } else if (isObject(config)) {
    next = config.next || next
    error = config.error || error
    complete = config.complete || complete
  }

  return { next, error, complete }
}

export const makeBaseRepository = next => {
  const in$ = makeBaseObserver((...args) => {
    next = next || ((...args) => args.length === 1 ? args[0] : args)
    Promise.resolve(next(...args)).then(data => {
      _outMid$.next(data)
    })
  })
  const _outMid$ = new Subject()
  const out$ = _outMid$.pipe(shareReplay(1))
  return {
    in: in$,
    mid: _outMid$,
    out: out$,
    array: [in$, out$, _outMid$]
  }
}
