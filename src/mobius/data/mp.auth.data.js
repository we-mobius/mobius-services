import { perf, get } from '../utils/index.js'
import { dataConfig, mpAuthState } from '../config/index.js'
import { getDataFromLocalStorage, setDataToLocalStorage } from '../common/index.js'
import { Biu } from '../libs/biu.js'

const biu = Biu.scope('inner').biu

// keep config fresh
const localStorageKeyName = () => get(dataConfig, 'auth.mp.localStorageKeyName')
const _getAuthStateFromLocal = () => getDataFromLocalStorage(localStorageKeyName) || {}
const _setAuthStateToLocal = authState => {
  setDataToLocalStorage(localStorageKeyName, authState)
}

const getAuthStateFromLocal = () => _getAuthStateFromLocal()
const setAuthStateToLocal = authState => {
  _setAuthStateToLocal(authState)
}

const loginUrl = () => get(dataConfig, 'auth.mp.requestInfo.loginUrl')
const getUserInfoUrl = () => get(dataConfig, 'auth.mp.requestInfo.getUserInfoUrl')

const currentAuth = () => mpAuthState

const login = async ({ type, scope, code }) => {
  let res
  const url = loginUrl()
  if (!url) {
    res = null
  } else {
    console.log(`[${perf.now}][MpAuthData] login: send a login request...`, { type, code })
    res = await biu({
      url: url,
      method: 'POST',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        action: 'get',
        payload: {
          type,
          scope,
          code
        }
      }
    })
      .then(response => {
        console.log(`[${perf.now}][MpAuthData] login: login request receives...`, response.data)
        return response.data.status === 'success' ? response.data.data[type] : null
      })
      .catch(e => {
        console.error(e)
        return null
      })
  }
  return res
}

const userInfo = async ({ id, by }) => {
  let res
  const url = getUserInfoUrl()
  const type = 'user_info'
  by = by || 'openid'
  id = id || currentAuth().openid
  if (!url) {
    res = null
  } else {
    console.log(`[${perf.now}][MpAuthData] userInfo: send a getUserInfo request...`, { id })
    res = await biu({
      url: url,
      method: 'POST',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        action: 'get',
        payload: {
          type,
          id,
          by
        }
      }
    })
      .then(response => {
        console.log(`[${perf.now}][MpAuthData] userInfo: getUserInfo request receives...`, response.data)
        return response.data.status === 'success' ? response.data.data[type] : null
      })
      .catch(e => {
        console.error(e)
        return null
      })
  }
  return res
}

export {
  getAuthStateFromLocal, setAuthStateToLocal,
  login, userInfo
}
