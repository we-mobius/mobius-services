import { getPropByPath } from '../libs/mobius-utils.js'
import {
  Subject,
  combineLatest,
  map, tap, merge,
  shareReplay
} from '../libs/rx.js'
import {
  deviceGeoOut$, deviceScreenOut$
} from '../domains/device/device.repository.js'

/******************************************
 *                  Input
 ******************************************/

// none

/******************************************
 *                  Output
 ******************************************/

const deviceGeoInitOut$ = new Subject()
const deviceGeoMutationOut$ = new Subject()
const deviceScreenInitOut$ = new Subject()
const deviceScreenMutationOut$ = new Subject()

const deviceGeoOutShare$ = merge(deviceGeoInitOut$, deviceGeoMutationOut$).pipe(
  shareReplay(1)
)
const deviceScreenOutShare$ = merge(deviceScreenInitOut$, deviceScreenMutationOut$).pipe(
  shareReplay(1)
)

const deviceInfoOutShare$ = combineLatest(deviceGeoOutShare$, deviceScreenOutShare$).pipe(
  shareReplay(1)
)

const deviceInfoOutShareChunked$ = deviceInfoOutShare$.pipe(
  map(([geoInfo, screenInfo]) => {
    return {
      ...geoInfo,
      ...screenInfo
    }
  }),
  shareReplay(1)
)

const _observablesMap = new Map()
const observables = {
  hybrid: () => deviceInfoOutShare$,
  trigger: type => {
    let res
    switch (type) {
      case 'geo':
        res = deviceGeoOut$.pipe(
          tap(deviceGeo => {
            deviceGeoInitOut$.next(deviceGeo)
          })
        )
        break
      case 'screen':
        res = deviceScreenOut$.pipe(
          tap(deviceScreen => {
            deviceScreenInitOut$.next(deviceScreen)
          })
        )
    }
    if (!res) throw Error('Expected type of deviceObservables: geo|screen ...')
    return res
  },
  chunk: () => deviceInfoOutShareChunked$,
  select: path => {
    let res$ = _observablesMap.get(path)
    if (!res$) {
      res$ = deviceInfoOutShareChunked$.pipe(
        map(deviceInfoChunk => getPropByPath(path, deviceInfoChunk)),
        shareReplay(1)
      )
      _observablesMap.set(path, res$)
    }
    return res$
  }
}

export {
  observables as deviceObservables
}
