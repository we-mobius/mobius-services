import {
  pathIn$, pathOut$,
  searchIn$, searchOut$,
  hashIn$, hashOut$,
  hrefIn$, hrefOut$
} from '../domains/router/router.repository.js'
import { shareReplay } from '../libs/rx.js'

/******************************************
 *                  Input
 ******************************************/

const observers = new Map([
  ['path', pathIn$],
  ['search', searchIn$],
  ['hash', hashIn$],
  ['href', hrefIn$]
])

/******************************************
 *                 Output
 ******************************************/

const pathOutShare$ = pathOut$.pipe(shareReplay(1))
const searchOutShare$ = searchOut$.pipe(shareReplay(1))
const hashOutShare$ = hashOut$.pipe(shareReplay(1))
const hrefOutShare$ = hrefOut$.pipe(shareReplay(1))

const observables = new Map([
  ['path', pathOutShare$],
  ['search', searchOutShare$],
  ['hash', hashOutShare$],
  ['href', hrefOutShare$]
])

export {
  observers as routerObservers,
  observables as routerObservables
}
