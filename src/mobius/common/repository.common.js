import { Subject, shareReplay } from '../libs/rx.js'

export const makeBaseRepository = next => {
  const in$ = {
    next: (...args) => {
      next = next || ((...args) => args.length === 1 ? args[0] : args)
      Promise.resolve(next(...args)).then(data => {
        _outMid$.next(data)
      })
    },
    error: () => {},
    complete: () => {}
  }
  const _outMid$ = new Subject()
  const out$ = _outMid$.pipe(shareReplay(1))
  return {
    in: in$,
    mid: _outMid$,
    out: out$,
    array: [in$, out$, _outMid$]
  }
}
