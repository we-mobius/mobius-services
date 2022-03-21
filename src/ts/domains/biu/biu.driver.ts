
import { createGeneralDriver, useGeneralDriver_ } from '../../libs/mobius-utils'

import type {
  ReplayDataMediator,
  DriverOptions, DriverLevelContexts, DriverSingletonLevelContexts, DriverInstance,
  BiuOptions
} from '../../libs/mobius-utils'

export interface BiuDriverOptions extends DriverOptions {

}
export interface BiuSingletonLevelContexts extends DriverSingletonLevelContexts {

}
export type BiuDriverInstance = BiuSingletonLevelContexts

export const makeBiuDriver =
createGeneralDriver<BiuDriverOptions, DriverLevelContexts, BiuSingletonLevelContexts, BiuDriverInstance>({
  defaultOptions: {},
  prepareSingletonLevelContexts: (options, driverLevelContexts) => {
    return {}
  }
})

/**
 * @see {@link makeBiuDriver}
 */
export const useBiuDriver = useGeneralDriver_(makeBiuDriver)
