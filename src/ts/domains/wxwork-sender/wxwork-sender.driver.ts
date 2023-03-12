import {
  Biutor,
  Data, replayWithLatest,
  createGeneralDriver, useGeneralDriver_
} from '../../libs/mobius-utils'

import type {
  ReplayDataMediator,
  DriverOptions, DriverLevelContexts, DriverSingletonLevelContexts, DriverInstance
} from '../../libs/mobius-utils'
import { TextMessage, MarkdownMessage, WXWorkMessageUnion } from './wxwork-sender.base'

export interface WXWorkSenderDriverOptions extends DriverOptions {
  sendKey: string
}
export interface WXWorkSenderDriverLevelContexts extends DriverLevelContexts {}
export interface WXWorkSenderDriverSingletonLevelContexts extends DriverSingletonLevelContexts {
  inputs: {
    message: Data<WXWorkMessageUnion>
    atText: Data<TextMessage['text']>
    text: Data<string>
    markdown: Data<string>
  }
  outputs: {
    message: ReplayDataMediator<WXWorkMessageUnion>
    atText: ReplayDataMediator<TextMessage['text']>
    text: ReplayDataMediator<string>
    markdown: ReplayDataMediator<string>
  }
}
export type WXWorkSenderDriverInstance = WXWorkSenderDriverSingletonLevelContexts

const WXWORK_WEBHOOK_URL = 'https://qyapi.weixin.qq.com/cgi-bin/webhook'
export const makeWXWorkSenderDriver =
createGeneralDriver<WXWorkSenderDriverOptions, WXWorkSenderDriverLevelContexts, WXWorkSenderDriverSingletonLevelContexts, WXWorkSenderDriverInstance>({
  prepareSingletonLevelContexts: (options, driverLevelContexts) => {
    const messageD = Data.empty<WXWorkMessageUnion>()
    const messageRD = replayWithLatest(1, messageD)
    const atTextD = Data.empty<TextMessage['text']>()
    const atTextRD = replayWithLatest(1, atTextD)
    const textD = Data.empty<string>()
    const textRD = replayWithLatest(1, textD)
    const markdownD = Data.empty<string>()
    const markdownRD = replayWithLatest(1, markdownD)

    messageD.subscribeValue(message => {
      try {
        void Biutor.of({
          resource: `${WXWORK_WEBHOOK_URL}/send?key=${options.sendKey}`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        }).sendRequest()
      } catch (e) {
        console.error('[WXWorkSenderDriver] error occured when send message to target webhook address: ', e)
      }
    })
    atTextD.subscribeValue(atText => {
      try {
        const bodyData: TextMessage = { msgtype: 'text', text: atText }
        void Biutor.of({
          resource: `${WXWORK_WEBHOOK_URL}/send?key=${options.sendKey}`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        }).sendRequest()
      } catch (e) {
        console.error('[WXWorkSenderDriver] error occured when send message(atText type) to target webhook address: ', e)
      }
    })
    textD.subscribeValue(text => {
      try {
        const bodyData: TextMessage = { msgtype: 'text', text: { content: text } }
        void Biutor.of({
          resource: `${WXWORK_WEBHOOK_URL}/send?key=${options.sendKey}`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        }).sendRequest()
      } catch (e) {
        console.error('[WXWorkSenderDriver] error occured when send message(text type) to target webhook address: ', e)
      }
    })
    markdownD.subscribeValue(content => {
      try {
        const bodyData: MarkdownMessage = { msgtype: 'markdown', markdown: { content } }
        void Biutor.of({
          resource: `${WXWORK_WEBHOOK_URL}/send?key=${options.sendKey}`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        }).sendRequest()
      } catch (e) {
        console.error('[WXWorkSenderDriver] error occured when send message(markdown type) to target webhook address: ', e)
      }
    })

    return {
      inputs: {
        message: messageD,
        atText: atTextD,
        text: textD,
        markdown: markdownD
      },
      outputs: {
        message: messageRD,
        atText: atTextRD,
        text: textRD,
        markdown: markdownRD
      }
    }
  }
})

/**
 * @see {@link makeWXWorkSenderDriver}
 */
export const useWXWorkSenderDriver = useGeneralDriver_(makeWXWorkSenderDriver)
