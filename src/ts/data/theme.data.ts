import {
  isUndefined
} from '../libs/mobius-utils'
import {
  getDatasetValueFromElement
} from './dom.data'

/**********************************************************************************************************************
 *
 *                                                  Preferred Color Scheme
 *
 **********************************************************************************************************************/

/**
 *
 */
export enum PreferredColorScheme {
  Light = 'light',
  Dark = 'dark',
  Unknown = 'unknown'
}
const PREFERRED_COLOR_SCHEME: string[] = Object.values(PreferredColorScheme)

export const getPreferredColorSchemeFromMedia = (): PreferredColorScheme => {
  const darkMedia = window.matchMedia('(prefers-color-scheme: dark)')
  if (darkMedia.matches) {
    return PreferredColorScheme.Dark
  }
  const lightMedia = window.matchMedia('(prefers-color-scheme: light)')
  if (lightMedia.matches) {
    return PreferredColorScheme.Light
  }
  return PreferredColorScheme.Unknown
}

/**
 * Play with Mobius UI Styles.
 *
 * Mobius UI will send set of values which different by media query
 *   through set CSS variables on root `html` element.
 */
export const getPreferredColorSchemeFromCSS = (): PreferredColorScheme => {
  const preferredColorScheme = getComputedStyle(document.documentElement)
    .getPropertyValue('--prefers-color-scheme').replace(/["' ]/g, '')
  return preferredColorScheme as PreferredColorScheme
}

export const getPreferredColorSchemeFromDOM = (target: string | HTMLElement, keyname: string): PreferredColorScheme => {
  const preferredColorScheme = getDatasetValueFromElement(target, keyname)?.toLowerCase()

  if (isUndefined(preferredColorScheme)) {
    return PreferredColorScheme.Unknown
  } else {
    return PREFERRED_COLOR_SCHEME.includes(preferredColorScheme)
      ? preferredColorScheme as PreferredColorScheme
      : PreferredColorScheme.Unknown
  }
}

export const getPreferredColorSchemeFromDefault = (): PreferredColorScheme => {
  const hour = new Date().getHours()
  if (hour >= 6 && hour <= 18) {
    return PreferredColorScheme.Light
  } else {
    return PreferredColorScheme.Dark
  }
}

/**********************************************************************************************************************
 *
 *                                                  Preferred Light Source
 *
 **********************************************************************************************************************/

/**
 *
 */
export enum PreferredLightSource {
  LT2RB = 'lt2rb',
  RT2LB = 'rt2lb',
  RB2LT = 'rb2lt',
  LB2RT = 'lb2rt',
  Unknown = 'unknown'
}
const PREFERRED_LIGHT_SOURCES: string[] = Object.values(PreferredLightSource)

export const getPreferredLightSourceFromDOM = (target: string | HTMLElement, keyname: string): PreferredLightSource => {
  const preferredLightSource = getDatasetValueFromElement(target, keyname)

  if (isUndefined(preferredLightSource)) {
    return PreferredLightSource.Unknown
  } else {
    return PREFERRED_LIGHT_SOURCES.includes(preferredLightSource)
      ? preferredLightSource as PreferredLightSource
      : PreferredLightSource.Unknown
  }
}

export const getPreferredLightSourceFromDefault = (): PreferredLightSource => {
  const hour = new Date().getHours()
  const lightSource = (PREFERRED_LIGHT_SOURCES as PreferredLightSource[])[Math.floor(hour / 6 % 4)]
  return lightSource
}
