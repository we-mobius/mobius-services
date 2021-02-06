import {
  pathnameIn$, pathnameOut$,
  searchIn$, searchOut$,
  hashIn$, hashOut$,
  hrefIn$, hrefOut$
} from '../domains/router/router.repository.js'
import { shareReplay } from '../libs/rx.js'

/******************************************
 *                  Input
 ******************************************/

const observers = new Map([
  ['pathname', pathnameIn$],
  ['search', searchIn$],
  ['hash', hashIn$],
  ['href', hrefIn$]
])

/******************************************
 *                 Output
 ******************************************/

const pathnameOutShare$ = pathnameOut$.pipe(shareReplay(1))
const searchOutShare$ = searchOut$.pipe(shareReplay(1))
const hashOutShare$ = hashOut$.pipe(shareReplay(1))
const hrefOutShare$ = hrefOut$.pipe(shareReplay(1))

const observables = new Map([
  ['pathname', pathnameOutShare$],
  ['search', searchOutShare$],
  ['hash', hashOutShare$],
  ['href', hrefOutShare$]
])

export {
  observers as routerObservers,
  observables as routerObservables
}
