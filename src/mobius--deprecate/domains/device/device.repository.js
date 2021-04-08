import {
  Observable
} from '../../libs/rx.js'
import {
  getDeviceGeo,
  getDeviceScreen
} from '../../data/device.data.js'

const deviceGeoOut$ = new Observable(observer => {
  getDeviceGeo().then(deviceGeo => {
    observer.next(deviceGeo || {})
    observer.complete()
  })
})

const deviceScreenOut$ = new Observable(observer => {
  getDeviceScreen().then(deviceScreen => {
    observer.next(deviceScreen || {})
    observer.complete()
  })
})

export {
  deviceGeoOut$, deviceScreenOut$
}
