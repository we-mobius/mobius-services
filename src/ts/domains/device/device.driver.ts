import {
  adaptMultipleEnvironments, debounceS,
  Data, replayWithLatest,
  createGeneralDriver, useGeneralDriver_
} from '../../libs/mobius-utils'
import { getDeviceScreenInfo } from '../../data/device.data'

import type {
  ReplayDataMediator,
  DriverOptions, DriverLevelContexts, DriverSingletonLevelContexts, DriverInstance
} from '../../libs/mobius-utils'
import type {
  DeviceScreenInfo
} from '../../data/device.data'

export interface DeviceDriverOptions extends DriverOptions {
  isAutoUpdate?: boolean
}
export interface DeviceDriverSingletonLevelContexts extends DriverSingletonLevelContexts {
  inputs: {
    options: Data<DeviceDriverOptions>
  }
  outputs: {
    options: ReplayDataMediator<DeviceDriverOptions>
    screenInfo: ReplayDataMediator<DeviceScreenInfo>
  }
}
export interface DeviceDriverInstance extends DriverInstance {
  inputs: {
    options: Data<DeviceDriverOptions>
  }
  outputs: {
    options: ReplayDataMediator<DeviceDriverOptions>
    screenInfo: ReplayDataMediator<DeviceScreenInfo>
  }
}

export const DEFAULT_DEVICE_DRIVER_OPTIONS: Required<DeviceDriverOptions> = {
  isAutoUpdate: true
}

export const makeDeviceDriver =
createGeneralDriver<DeviceDriverOptions, DriverLevelContexts, DeviceDriverSingletonLevelContexts, DeviceDriverInstance>({
  prepareSingletonLevelContexts: (options, driverLevelContexts) => {
    const optionsD = Data.of(options)
    const optionsRD = replayWithLatest(1, optionsD)

    const screenInfoRD = replayWithLatest(1, Data.empty<DeviceScreenInfo>({}))

    const { isAutoUpdate } = {
      ...DEFAULT_DEVICE_DRIVER_OPTIONS,
      ...options
    }

    const deviceScreenInfo = getDeviceScreenInfo()
    screenInfoRD.mutate(() => deviceScreenInfo)

    if (isAutoUpdate) {
      adaptMultipleEnvironments({
        forWeb: ({ window }) => {
          window.addEventListener('resize', debounceS(() => {
            const deviceScreenInfo = getDeviceScreenInfo()
            screenInfoRD.mutate(() => deviceScreenInfo)
          }, 200))
        },
        forWXMINA: ({ wxmina }) => {
          wxmina.onWindowResize(debounceS(() => {
            const deviceScreenInfo = getDeviceScreenInfo()
            screenInfoRD.mutate(() => deviceScreenInfo)
          }, 200))
        }
      })
    }

    return {
      inputs: {
        options: optionsD
      },
      outputs: {
        options: optionsRD,
        screenInfo: screenInfoRD
      }
    }
  }
})

/**
 * @see {@link makeDeviceDriver}
 */
export const useDeviceDriver = useGeneralDriver_(makeDeviceDriver)
