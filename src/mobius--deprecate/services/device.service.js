import { perf, debounce, adaptMultiPlatform } from '../libs/mobius-utils.js'
import {
  deviceObservables
} from '../drivers/device.driver.js'
import { wxmina } from '../libs/wx.js'

const initDevice = ({
  sync = false
} = { sync: false }) => {
  let promise
  console.log(`[${perf.now}][DeviceService] initDevice(${sync ? 'sync' : ''}): subscribe to deviceObservables.hybrid()...`)
  deviceObservables.hybrid().subscribe(() => {})
  if (!sync) {
    deviceObservables.trigger('screen').subscribe(screenInfo => {
      console.log(`[${perf.now}][DeviceService] initDevice: deviceObservables.init() receives init device info...`, screenInfo)
    })
    deviceObservables.trigger('geo').subscribe(geoInfo => {
      console.log(`[${perf.now}][DeviceService] initDevice: deviceObservables.init() receives init geo info...`, geoInfo)
    })
  } else {
    promise = Promise.all([
      new Promise(resolve => {
        deviceObservables.trigger('screen').subscribe(screenInfo => {
          console.log(`[${perf.now}][DeviceService] initDevice: deviceObservables.init() receives init device info...`, screenInfo)
          resolve(screenInfo)
        })
      }),
      new Promise(resolve => {
        deviceObservables.trigger('geo').subscribe(geoInfo => {
          console.log(`[${perf.now}][DeviceService] initDevice: deviceObservables.init() receives init geo info...`, geoInfo)
          resolve(geoInfo)
        })
      })
    ])
  }

  console.log(`[${perf.now}][DeviceService] initDevice: initialize screen resize change triggers...`)
  adaptMultiPlatform({
    webFn: () => {
      window.addEventListener('resize', debounce(() => {
        deviceObservables.trigger('screen').subscribe(() => {})
      }, 200))
    },
    wxminaFn: () => {
      wxmina.onWindowResize(debounce(() => {
        deviceObservables.trigger('screen').subscribe(() => {})
      }, 200))
    }
  })

  return promise
}

export {
  initDevice, deviceObservables
}
