import { perf } from '../libs/mobius-utils.js'
import {
  AUTH,
  isValidMpAuthState
} from '../const/index.js'
import {
  mpAuthObservers, mpAuthObservables
} from '../drivers/mp.auth.driver.js'

const DEFAULT_LOGIN_SCOPE = 'snsapi_base'
const getCodeUrl = ({ appId, redirectUri, scope, state }) => `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
const getSearches = searchString => {
  const res = {}
  if (searchString.length > 1) {
    const searches = searchString.substr(1).split('&')
    searches.forEach(item => {
      let [key, value] = item.split('=')
      key = decodeURIComponent(key)
      value = value ? decodeURIComponent(value) : ''
      res[key] = value
    })
  }
  return res
}
const getMpAuthCode = ({
  appId = '',
  redirectUri = '',
  scope = ''
}) => {
  let code
  const searches = getSearches(window.location.search)
  console.log(`[${perf.now}][MpAuthService] getCode: getSearches...`, searches)
  if (searches.state !== 'mpauthservice_authed') {
    const getCodeParams = {
      appId: appId,
      redirectUri: encodeURIComponent(redirectUri || window.location.href),
      scope: scope || DEFAULT_LOGIN_SCOPE,
      state: 'mpauthservice_authed'
    }
    window.location.href = getCodeUrl(getCodeParams)
  } else {
    code = searches.code
    console.log(`[${perf.now}][MpAuthService] getCode: code received...`, code)
  }
  return code
}

const initMpAuth = ({
  preLogin = false,
  preGetUserInfo = true,
  appId = '',
  redirectUri = '',
  scope = ''
}) => {
  if (preLogin && !appId) {
    throw Error('[MpAuthService][initMpAuth] preLogin expects appId to be provided')
  }
  if (preLogin && !redirectUri) {
    console.warn('[MpAuthService][initMpAuth] preLogin is set but no redirectUri provided, %ccurrent href%c will be used automatically', 'color: #f00', 'color: #000')
  }
  if (preLogin && !scope) {
    console.warn('[MpAuthService][initMpAuth] preLogin is set but no scope provided, %csnsapi_base%c will be used automatically', 'color: #f00', 'color: #000')
  }
  if (preGetUserInfo && scope !== 'snsapi_userinfo') {
    throw Error('[MpAuthService][initMpAuth] preGetUserInfo expects scope to be snsapi_userinfo')
  }
  console.log(`[${perf.now}][MpAuthService] initMpAuth: subscribe to 'auth_state' type of mpAuthObservables...`)
  mpAuthObservables.type('auth_state').select().subscribe(authState => {
    console.log(`[${perf.now}][MpAuthService] initMpAuth: 'auth_state' type of mpAuthObservables receives...`, authState)
    if (!isValidMpAuthState(authState)) {
      console.log(`[${perf.now}][MpAuthService] initMpAuth: authState received NOT valid, preparing to logout...`, authState)
      mpAuthObservers.select(AUTH.TYPE.LOGOUT).next()
      if (preLogin) {
        const code = getMpAuthCode({ appId, redirectUri, scope })
        console.log(`[${perf.now}][MpAuthService] initMpAuth: execute preLogin...`, { appId, redirectUri, scope, code })
        if (code) {
          mpAuthObservers.select(AUTH.TYPE.LOGIN).next({
            type: scope || DEFAULT_LOGIN_SCOPE,
            scope: scope || DEFAULT_LOGIN_SCOPE,
            code: code
          })
        }
      }
    } else {
      console.log(`[${perf.now}][MpAuthService] initMpAuth: preGetUserInfo, current auth scope...`, authState.scope)
      if (preGetUserInfo && authState.scope.indexOf('snsapi_userinfo') > -1) {
        console.log(`[${perf.now}][MpAuthService] initMpAuth: authState received valid, preGetUserInfo...`, authState)
        mpAuthObservers.select(AUTH.TYPE.USERINFO).next({})
      }
    }
  })
  console.log(`[${perf.now}][MpAuthService] initMpAuth: subscribe to 'user_info' type of mpAuthObservables...`)
  mpAuthObservables.type('user_info').select().subscribe(userInfo => {
    console.log(`[${perf.now}][MpAuthService] initMpAuth: 'user_info' type of mpAuthObservables receives...`, userInfo)
  })

  console.log(`[${perf.now}][MpAuthService] initMpAuth: trigger 'auth_state' type of mpAuthObservables...`)
  mpAuthObservables.trigger('auth_state').subscribe(authState => {
    console.log(`[${perf.now}][MpAuthService] initMpAuth: trigger of 'auth_state' type of mpAuthObservables receives...`, authState)
  })
}

export {
  initMpAuth, mpAuthObservers, mpAuthObservables, getMpAuthCode
}
