import {
  adaptMultipleEnvironments,
  Data,
  replayWithLatest,
  pluckT,
  createGeneralDriver, useGeneralDriver_
} from '../../libs/mobius-utils'
import {
  getPreferredColorSchemeFromMedia, getPreferredColorSchemeFromCSS, getPreferredColorSchemeFromDOM, getPreferredColorSchemeFromDefault,
  getPreferredLightSourceFromDOM, getPreferredLightSourceFromDefault
} from '../../data/theme.data'
import { AppThemePreferredColorScheme, AppThemePreferredLightSource } from './app-theme.const'

import type {
  ReplayDataMediator,
  DriverOptions, DriverLevelContexts, DriverSingletonLevelContexts
} from '../../libs/mobius-utils'
import type { AppTheme } from './app-theme.const'

export interface AppThemeDriverOptions extends DriverOptions {
  /**
   * Whether the theme is auto toggle with browser's apperences or other settings.
   *
   * @default true
   */
  isAutoToggle?: boolean
  /**
    * Whether the 'unknown' color scheme or other theme item is expected.
    *   If false, the 'unknown' value will be warned.
    *
    * @default false
    */
  isExpectUnknown?: boolean

  initPreferredColorScheme?: AppThemePreferredColorScheme
  initPreferredLightSource?: AppThemePreferredLightSource

  preferredColorSchemeClue?: [HTMLElement | string, string]
  preferredLightSourceClue?: [HTMLElement | string, string]
}
export interface AppThemeDriverSingletonLevelContexts extends DriverSingletonLevelContexts {
  inputs: {
    options: Data<AppThemeDriverOptions>
  }
  outputs: {
    options: ReplayDataMediator<AppThemeDriverOptions>
    theme: ReplayDataMediator<AppTheme>
    preferredColorScheme: ReplayDataMediator<AppThemePreferredColorScheme>
    preferredLightSource: ReplayDataMediator<AppThemePreferredLightSource>
  }
}
export interface AppThemeDriverInstance extends AppThemeDriverSingletonLevelContexts { }

export const DEFAULT_APP_THEME_DRIVER_OPTIONS: Required<AppThemeDriverOptions> = {
  isAutoToggle: true,
  isExpectUnknown: false,
  initPreferredColorScheme: AppThemePreferredColorScheme.Unknown,
  initPreferredLightSource: AppThemePreferredLightSource.Unknown,
  preferredColorSchemeClue: [document.documentElement, 'theme'],
  preferredLightSourceClue: [document.documentElement, 'source']
}

/**
 *
 */
export const makeAppThemeDriver =
  createGeneralDriver<AppThemeDriverOptions, DriverLevelContexts, AppThemeDriverSingletonLevelContexts, AppThemeDriverInstance>({
    prepareSingletonLevelContexts: (options, driverLevelContexts) => {
      const optionsD = Data.of(options)
      const optionsRD = replayWithLatest(1, optionsD)

      const themeRD = replayWithLatest(1, Data.of<AppTheme>({
        preferredColorScheme: AppThemePreferredColorScheme.Unknown, preferredLightSource: AppThemePreferredLightSource.Unknown
      }))
      const preferredColorSchemeRD = replayWithLatest(1, pluckT<AppTheme, AppThemePreferredColorScheme>('preferredColorScheme', themeRD))
      const preferredLightSourceRD = replayWithLatest(1, pluckT<AppTheme, AppThemePreferredLightSource>('preferredLightSource', themeRD))

      const {
        isAutoToggle, isExpectUnknown,
        initPreferredColorScheme, initPreferredLightSource,
        preferredColorSchemeClue, preferredLightSourceClue
      } = { ...DEFAULT_APP_THEME_DRIVER_OPTIONS, ...options }

      const preferredColorScheme = isAutoToggle
        ? [
            getPreferredColorSchemeFromMedia(),
            getPreferredColorSchemeFromDOM(...preferredColorSchemeClue),
            getPreferredColorSchemeFromCSS(),
            getPreferredColorSchemeFromDefault()
          ].find(colorScheme => colorScheme !== AppThemePreferredColorScheme.Unknown) ?? AppThemePreferredColorScheme.Unknown
        : [
            initPreferredColorScheme,
            getPreferredColorSchemeFromDOM(...preferredColorSchemeClue),
            getPreferredColorSchemeFromCSS(),
            getPreferredColorSchemeFromDefault()
          ].find(colorScheme => colorScheme !== AppThemePreferredColorScheme.Unknown) ?? AppThemePreferredColorScheme.Unknown

      themeRD.mutate(() => ({ ...themeRD.value, preferredColorScheme: preferredColorScheme }))

      const preferredLightSource = [
        initPreferredLightSource,
        getPreferredLightSourceFromDOM(...preferredLightSourceClue),
        getPreferredLightSourceFromDefault()
      ].find(lightSource => lightSource !== AppThemePreferredLightSource.Unknown) ?? AppThemePreferredLightSource.Unknown

      themeRD.mutate(() => ({ ...themeRD.value, preferredLightSource: preferredLightSource }))

      if (isAutoToggle) {
        adaptMultipleEnvironments({
          forWeb: () => {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
              if (e.matches) {
                themeRD.mutate(() => ({ ...themeRD.value, preferredColorScheme: AppThemePreferredColorScheme.Dark }))
              }
            })
            window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
              if (e.matches) {
                themeRD.mutate(() => ({ ...themeRD.value, preferredColorScheme: AppThemePreferredColorScheme.Light }))
              }
            })
          },
          forWXMINA: ({ wxmina }) => {
            wxmina.onThemeChange(({ theme }) => {
              const preferredColorScheme = theme === 'dark' ? AppThemePreferredColorScheme.Dark : AppThemePreferredColorScheme.Light
              themeRD.mutate(() => ({ ...themeRD.value, preferredColorScheme: preferredColorScheme }))
            })
          }
        })
      }

      if (!isExpectUnknown) {
        themeRD.subscribeValue(theme => {
          for (const [key, value] of Object.entries(theme)) {
            if (value === 'unknown') {
              console.warn(`[MobiusServices::AppThemeDriver] The 'unknown' value for ${key} is unexpected.`)
            }
          }
        })
      }

      return {
        inputs: {
          options: optionsD
        },
        outputs: {
          options: optionsRD,
          theme: themeRD,
          preferredColorScheme: preferredColorSchemeRD,
          preferredLightSource: preferredLightSourceRD
        }
      }
    }
  })

/**
 * @see {@link makeAppThemeDriver}
 */
export const useAppThemeDriver = useGeneralDriver_(makeAppThemeDriver)
