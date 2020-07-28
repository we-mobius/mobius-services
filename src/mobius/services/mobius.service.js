import { adaptMultiPlatformAwait } from '../common/index'

import { initConfig, getConfig } from './config.service.js'
import { initRequest } from './request.service.js'
import { initAuth } from './auth.service.js'
import { initTheme } from './theme.service.js'
import { initDevice } from './device.service.js'

const initMobiusJS = async ({
  getConfigUrl = '',
  setConfigUrl = '',
  userPoolId = '',
  getThemeUrl = '',
  setThemeUrl = '',
  getAPITicketUrl = '',
  mpLoginUrl = '',
  mpGetUserInfoUrl = '',
  getWepayParamsUrl = '',
  getTradeStateUrl = '',
  modeHandler = mode => {},
  lightSourceHandler = lightSource => {}
}) => {
  const commonFn = async () => {
    // NOTE: 初始化配置，在初始化应用其它业务之前进行
    await initConfig({
      data: {
        config: {
          requestInfo: {
            getConfigUrl: getConfigUrl,
            setConfigUrl: setConfigUrl
          }
        },
        auth: {
          authing: {
            authingOptions: {
              userPoolId: userPoolId
            }
          },
          mp: {
            requestInfo: {
              loginUrl: mpLoginUrl,
              getUserInfoUrl: mpGetUserInfoUrl
            }
          }
        },
        theme: {
          requestInfo: {
            getThemeUrl: getThemeUrl,
            setThemeUrl: setThemeUrl
          }
        },
        mp_api: {
          requestInfo: {
            getAPITicketUrl: getAPITicketUrl
          }
        },
        payment: {
          wepay: {
            requestInfo: {
              getWepayParamsUrl: getWepayParamsUrl,
              getTradeStateUrl: getTradeStateUrl
            }
          }
        }
      },
      repository: {
        auth: {
          authing: {
            saveTo: 'local'
          }
        },
        config: {
          saveTo: 'server'
        },
        theme: {
          saveTo: 'server'
        }
      }
    })

    initRequest({
      withToken: true // default to true
    })

    await initAuth()
  }
  await adaptMultiPlatformAwait({
    webFn: async () => {
      await commonFn()
      initTheme({
        // modeHandler: mode => {},
        // lightSourceHandler: lightSource => {},
        isAutoToggle: () => getConfig('service.theme.autoToggle')
      })
      initDevice({ })
    },
    wxminaFn: async () => {
      await commonFn()

      initTheme({
        modeHandler: modeHandler,
        lightSourceHandler: lightSourceHandler,
        isAutoToggle: () => getConfig('service.theme.autoToggle')
      })

      initDevice({ })
    }
  })
}

export { initMobiusJS }
