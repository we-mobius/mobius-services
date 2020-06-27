/**
 * 初始化主题
 * - Mode
 * - LightSource
 */

import { get } from '../utils/index.js'
import { getDataFromLocalStorage, setDataToLocalStorage } from '../common/index.js'
import { THEME, isValidThemeMode, isValidThemeLightSource } from '../const/index.js'
import { dataConfig } from '../config/index.js'

// keep config fresh
const localStorageKeyName = () => get(dataConfig, 'theme.localStorageKeyName')
const _getThemeFromLocal = () => getDataFromLocalStorage(localStorageKeyName()) || {}
const _setThemeToLocal = theme => {
  setDataToLocalStorage(localStorageKeyName(), theme)
}

/*********************************************************
 *                          Mode
 * - 用户设置的主题 → LocalStorage
 * - 从 CSS 中获取当前浏览器的主题 → 根元素 --mode 样式属性
 * - 获取开发者在 DOM 中设置的主题 → 根元素 data-theme
 * - 使用默认主题 → Light
 *********************************************************/

// TODO: 从服务端获取
const getModeFromServer = () => {
  return false
}
const setModeToServer = (mode) => {}
const getModeFromLocal = () => {
  const mode = _getThemeFromLocal().mode
  return isValidThemeMode(mode) ? mode : false
}
const setModeToLocal = mode => {
  if (isValidThemeMode(mode)) {
    const theme = _getThemeFromLocal()
    theme.mode = mode
    _setThemeToLocal(theme)
  }
}
const getModeFromCSS = () => {
  const mode = getComputedStyle(document.documentElement)
    .getPropertyValue('--mode').replace(/["' ]/g, '')
  return isValidThemeMode(mode) ? mode : false
}
const getModeFromDOM = () => {
  const mode = document.documentElement.dataset.mode
  return isValidThemeMode(mode) ? mode : false
}
const getModeFromDefault = () => THEME.MODE.DEFAULT

/********************************************************
 *                         LightSource
 * - 用户设置的光源 → LocalStorage
 * - 获取开发者在 DOM 中设置的光源 → 根元素 data-source
 * - 使用默认光源 → 根据时间调整
 ********************************************************/

// TODO: 从服务端获取
const getLightSourceFromServer = () => {
  return false
}
const setLightSourceToServer = (lightSource) => {}
const getLightSourceFromLocal = () => {
  const lightSource = _getThemeFromLocal().lightSource
  return isValidThemeLightSource(lightSource) ? lightSource : false
}
const setLightSourceToLocal = (lightSource) => {
  if (isValidThemeLightSource(lightSource)) {
    const theme = _getThemeFromLocal()
    theme.lightSource = lightSource
    _setThemeToLocal(theme)
  }
}
const getLightSourceFromDOM = () => {
  const lightSource = document.documentElement.dataset.source
  return isValidThemeLightSource(lightSource) ? lightSource : false
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
