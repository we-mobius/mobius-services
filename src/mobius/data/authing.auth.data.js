import { get } from '../utils/index.js'
import { isSeemsVaildAuthingToken } from '../const/index.js'
import { dataConfig, authingAuthState } from '../config/index.js'
import { getDataFromLocalStorage, setDataToLocalStorage } from '../common/index.js'
import { Authing } from '../libs/authing.js'

// keep config fresh
const localStorageKeyName = () => get(dataConfig, 'auth.authing.localStorageKeyName')
const _getAuthStateFromLocal = () => getDataFromLocalStorage(localStorageKeyName) || {}
const _setAuthStateToLocal = authState => {
  setDataToLocalStorage(localStorageKeyName, authState)
}

const getAuthStateFromLocal = () => _getAuthStateFromLocal()
const setAuthStateToLocal = authState => {
  _setAuthStateToLocal(authState)
}

const currentAuth = () => authingAuthState

// keep config fresh
const authingOptions = () => get(dataConfig, 'auth.authing.authingOptions')
const authingIns = (() => {
  const _authingInstanceMap = new Map()
  const _getAuthingInstance = (userPoolId) => {
    let instance = _authingInstanceMap.get(userPoolId)
    if (!instance) {
      // use token to initialize authing instance with login status
      // @see https://docs.authing.cn/authing/sdk/sdk-for-javascript#chu-shi-hua
      instance = isSeemsVaildAuthingToken(currentAuth())
        ? new Authing({
          userPoolId: userPoolId,
          accessToken: currentAuth().token
        })
        : new Authing({
          userPoolId: userPoolId
        })
      _authingInstanceMap.set(userPoolId, instance)
    }
    return instance
  }
  return () => _getAuthingInstance(authingOptions().userPoolId)
})()

const register = (options) => {
  return authingIns().register(options)
}
const login = (options) => {
  return authingIns().login(options)
}
const userInfo = () => {
  return authingIns().user({
    id: currentAuth()._id
  })
}
const logout = () => {
  let res
  try {
    res = authingIns().logout(currentAuth()._id)
  } catch (err) {
    res = Promise.resolve({})
  }
  return res
}

export {
  getAuthStateFromLocal, setAuthStateToLocal,
  register, login, userInfo, logout
}
