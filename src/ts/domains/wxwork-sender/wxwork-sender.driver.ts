import {
  Biutor,
  Data, replayWithLatest,
  createGeneralDriver, useGeneralDriver_
} from '../../libs/mobius-utils'

import type {
  ReplayDataMediator,
  DriverOptions, DriverLevelContexts, DriverSingletonLevelContexts, DriverInstance
} from '../../libs/mobius-utils'
import { WXWorkMessageUnion } from './wxwork-sender.base'

export interface WXWorkSenderDriverOptions extends DriverOptions {
  sendKey: string
}
export interface WXWorkSenderDriverLevelContexts extends DriverLevelContexts {}
export interface WXWorkSenderDriverSingletonLevelContexts extends DriverSingletonLevelContexts {
  inputs: {
    message: Data<WXWorkMessageUnion>
  }
  outputs: {
    message: ReplayDataMediator<WXWorkMessageUnion>
  }
}
export type WXWorkSenderDriverInstance = WXWorkSenderDriverSingletonLevelContexts

const WXWORK_WEBHOOK_URL = 'https://qyapi.weixin.qq.com/cgi-bin/webhook'
export const makeWXWorkSenderDriver =
createGeneralDriver<WXWorkSenderDriverOptions, WXWorkSenderDriverLevelContexts, WXWorkSenderDriverSingletonLevelContexts, WXWorkSenderDriverInstance>({
  prepareSingletonLevelContexts: (options, driverLevelContexts) => {
    const messageD = Data.empty<WXWorkMessageUnion>()
    const messageRD = replayWithLatest(1, messageD)

    messageD.subscribeValue(message => {
      try {
        void Biutor.of({
          resource: `${WXWORK_WEBHOOK_URL}/send?key=${options.sendKey}`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        }).sendRequest()
      } catch (e) {
        console.error(e)
      }
    })

    return {
      inputs: {
        message: messageD
      },
      outputs: {
        message: messageRD
      }
    }
  }
})

/**
 * @see {@link makeWXWorkSenderDriver}
 */
export const useWXWorkSenderDriver = useGeneralDriver_(makeWXWorkSenderDriver)
