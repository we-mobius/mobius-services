import { LOADER_TYPE } from '../const/loader.const.js'
import {
  jsIn$, jsOut$
} from '../domains/loader/loader.repository.js'
import { isFailResponse, isSuccessResponse } from '../libs/mobius-utils.js'
import { scan, shareReplay, filter, merge } from '../libs/rx.js'

/******************************************
 *                  Input
 ******************************************/

const observers = new Map([
  [LOADER_TYPE.js, jsIn$]
])

/******************************************
 *                 Output
 ******************************************/

const jsSuccessOut$ = jsOut$.pipe(
  filter(isSuccessResponse),
  scan((acc, cur) => {
    const prev = acc.data.collection
    const collection = cur.data.collection
    Object.entries(collection).forEach(([key, list]) => {
      // NOTE: 'newcome' group only preserve the latest updates
      if (key === 'newcome') {
        prev[key] = list
      } else {
        prev[key] = prev[key] || []
        prev[key] = Array.from(new Set(prev[key].concat(list)))
      }
    })
    const temp = { ...cur }
    temp.data.collection = prev
    return temp
  }, { data: { collection: {} } })
)
const jsFailOut$ = jsOut$.pipe(filter(isFailResponse))
const jsOutShare$ = merge(jsSuccessOut$, jsFailOut$).pipe(shareReplay(1))

const observables = new Map([
  [LOADER_TYPE.js, jsOutShare$]
])

export {
  observers as loaderObservers,
  observables as loaderObservables
}
