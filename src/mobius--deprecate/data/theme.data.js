/**
 * 初始化主题
 * - Mode
 * - LightSource
 */

import { perf, getPropByPath, throttle, packing } from '../libs/mobius-utils.js'
import { getDataFromLocalStorage, setDataToLocalStorage } from '../common/index.js'
import { THEME, isValidThemeMode, isValidThemeLightSource } from '../const/index.js'
import { dataConfig } from '../config/index.js'
import { Biu } from '../libs/biu.js'

const biu = Biu.scope('inner').biu

// keep config fresh
const localStorageKeyName = () => getPropByPath('theme.localStorageKeyName', dataConfig)
const _getThemeFromLocal = () => getDataFromLocalStorage(localStorageKeyName()) || {}
const _setThemeToLocal = theme => {
  setDataToLocalStorage(localStorageKeyName(), theme)
}

const getThemeUrl = () => getPropByPath('theme.requestInfo.getThemeUrl', dataConfig)
const setThemeUrl = () => getPropByPath('theme.requestInfo.setThemeUrl', dataConfig)
const getThemeFromServer = async () => {
  console.log(`[${perf.now}][ThemeData] getThemeFromServer: send a request...`)
  let res
  const url = getThemeUrl()
  if (url === '') {
    res = null
  } else {
    res = await biu({
      url: url,
      method: 'POST',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        action: 'get'
      }
    })
      .then(response => {
        return response.data.status === 'success' ? response.data.data.theme : null
      })
      .catch(e => null)
  }
  return res
}
const getThemeFromServerThrottled = throttle(getThemeFromServer)
const setThemeToServer = async changes => {
  console.log(`[${perf.now}][ThemeData] setThemeToServer: send a request...`, changes)
  let res
  const url = setThemeUrl()
  if (url === '') {
    res = null
  } else {
    res = await biu({
      url: url,
      method: 'POST',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        action: 'set',
        payload: {
          theme: {
            ...changes
          }
        }
      }
    })
      .then(response => {
        return response.data
      })
      .catch(e => null)
  }

  return res
}
// const setThemeToServerPacked = packing(setThemeToServer, 500)
const setThemeToServerPacked = setThemeToServer
/*********************************************************
 *                          Mode
 * - 用户设置的主题 → LocalStorage
 * - 获取开发者在 DOM 中设置的主题 → 根元素 data-theme
 * - 从 CSS 中获取当前浏览器的主题 → 根元素 --mode 样式属性
 * - 使用默认主题 → Light
 *********************************************************/

const getModeFromServer = async () => {
  const theme = await getThemeFromServerThrottled()
  return theme ? theme.mode : ''
}
const setModeToServer = async mode => {
  return setThemeToServerPacked({
    mode: mode
  })
}
const getModeFromLocal = () => {
  const mode = _getThemeFromLocal().mode
  return isValidThemeMode(mode) ? mode : ''
}
const setModeToLocal = mode => {
  if (isValidThemeMode(mode)) {
    const theme = _getThemeFromLocal()
    theme.mode = mode
    _setThemeToLocal(theme)
  }
}
const getModeFromDOM = () => {
  const mode = document.documentElement.dataset.mode
  return isValidThemeMode(mode) ? mode : ''
}
const getModeFromCSS = () => {
  const mode = getComputedStyle(document.documentElement)
    .getPropertyValue('--mode').replace(/["' ]/g, '')
  return isValidThemeMode(mode) ? mode : ''
}
const getModeFromDefault = () => THEME.MODE.DEFAULT

/********************************************************
 *                         LightSource
 * - 用户设置的光源 → LocalStorage
 * - 获取开发者在 DOM 中设置的光源 → 根元素 data-source
 * - 使用默认光源 → 根据时间调整
 ********************************************************/

const getLightSourceFromServer = async () => {
  const theme = await getThemeFromServerThrottled()
  return theme ? theme.lightSource : ''
}
const setLightSourceToServer = async lightSource => {
  return setThemeToServerPacked({
    lightSource: lightSource
  })
}
const getLightSourceFromLocal = () => {
  const lightSource = _getThemeFromLocal().lightSource
  return isValidThemeLightSource(lightSource) ? lightSource : ''
}
const setLightSourceToLocal = lightSource => {
  if (isValidThemeLightSource(lightSource)) {
    const theme = _getThemeFromLocal()
    theme.lightSource = lightSource
    _setThemeToLocal(theme)
  }
}
const getLightSourceFromDOM = () => {
  const lightSource = document.documentElement.dataset.source
  return isValidThemeLightSource(lightSource) ? lightSource : ''
}
const getLightSourceFromDefault = () => {
  const hour = new Date().getHours()
  const lightSource = Object.values(THEME.LIGHTSOURCE)[Math.floor(hour / 6 % 4)]
  return lightSource
}

export {
  getModeFromServer, setModeToServer,
  getModeFromLocal, setModeToLocal,
  getModeFromCSS,
  getModeFromDOM,
  getModeFromDefault,
  getLightSourceFromServer, setLightSourceToServer,
  getLightSourceFromLocal, setLightSourceToLocal,
  getLightSourceFromDOM,
  getLightSourceFromDefault
}
