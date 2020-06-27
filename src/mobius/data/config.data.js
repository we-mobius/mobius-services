/*
 * 获取配置
 *   1. 用户设置的配置
 *   2. 本地保存的配置
 *   3. 默认配置
 * 设置配置
 *   - 保存在本地
 *   - 保存至服务端
 */
import { get, deepCopy } from '../utils/index.js'
import { getDataFromLocalStorage, setDataToLocalStorage } from '../common/index.js'
import { dataConfig, defaultConfig } from '../config/index.js'
import { request } from '../libs/axios.js'

// keep config fresh
const localStorageKeyName = () => get(dataConfig, 'config.localStorageKeyName')
const _getConfigFromLocal = () => getDataFromLocalStorage(localStorageKeyName) || {}
const _setConfigToLocal = config => {
  setDataToLocalStorage(localStorageKeyName, config)
}

const getConfigUrl = () => get(dataConfig, 'config.requestInfo.getConfigUrl')
const setConfigUrl = () => get(dataConfig, 'config.requestInfo.setConfigUrl')
const getConfigFromServer = async () => {
  let res
  const url = getConfigUrl()
  if (url === '') {
    res = false
  } else {
    res = await request({
      url: url,
      method: 'POST',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        action: 'get'
      }
    }).then(response => {
      console.info(response)
    })
  }
  return res
}
const setConfigToServer = async (config) => {
  let res
  const url = setConfigUrl()

  if (url === '') {
    res = false
  } else {
    res = await request({
      url: url,
      method: 'POST',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        action: 'set',
        payload: {
          config: config
        }
      }
    }).then(response => {
      console.info(response)
    })
  }

  return res
}

const getConfigFromLocal = () => _getConfigFromLocal()
const setConfigToLocal = (config) => {
  _setConfigToLocal(config)
}

const getConfigFromDefault = () => deepCopy(defaultConfig)
const setConfigToDefault = (config) => {
  // NOTE: ConfigModel handles `setToConfig` automatically through Reactivity
}

export {
  getConfigFromServer, setConfigToServer,
  getConfigFromLocal, setConfigToLocal,
  getConfigFromDefault, setConfigToDefault
}
