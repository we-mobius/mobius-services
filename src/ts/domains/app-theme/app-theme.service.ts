import {
  isUndefined
} from '../../libs/mobius-utils'
import { DEFAULT_APP_THEME_DRIVER_OPTIONS, makeAppThemeDriver } from './app-theme.driver'

import type { UndefinedableByKeys } from '../../libs/mobius-utils'
import type { AppThemePreferredColorScheme, AppThemePreferredLightSource, AppTheme } from './app-theme.const'
import type { AppThemeDriverOptions, AppThemeDriverInstance } from './app-theme.driver'

export * from './app-theme.const'
export * from './app-theme.driver'

const defaultPreferredColorSchemeHandler = (preferredColorScheme: AppThemePreferredColorScheme): void => {
  document.documentElement.setAttribute('data-theme', preferredColorScheme)
}
const defaultPreferredLightSourceHandler = (lightSource: AppThemePreferredLightSource): void => {
  document.documentElement.setAttribute('data-source', lightSource.substring(0, 2))
}
const defaultThemeHandler = (theme: AppTheme): void => {
  //
}

export interface AppThemeInitOptions extends AppThemeDriverOptions {
  driverOptions?: AppThemeDriverOptions

  preferredColorSchemeHandler?: (preferredColorScheme: AppThemePreferredColorScheme) => void
  preferredLightSourceHandler?: (lightSource: AppThemePreferredLightSource) => void
  themeHandler?: (theme: AppTheme) => void
  instance?: AppThemeDriverInstance
}
export const DEFAULT_APP_THEME_INIT_OPTIONS: UndefinedableByKeys<Required<AppThemeInitOptions>, 'instance'> = {
  driverOptions: DEFAULT_APP_THEME_DRIVER_OPTIONS,
  ...DEFAULT_APP_THEME_DRIVER_OPTIONS,

  preferredColorSchemeHandler: defaultPreferredColorSchemeHandler,
  preferredLightSourceHandler: defaultPreferredLightSourceHandler,
  themeHandler: defaultThemeHandler,
  instance: undefined
}

export interface AppThemeInitResult {
  appThemeDriver: AppThemeDriverInstance
}

export const initAppTheme = (options: AppThemeInitOptions = DEFAULT_APP_THEME_INIT_OPTIONS): AppThemeInitResult => {
  const {
    driverOptions, preferredColorSchemeHandler, preferredLightSourceHandler, themeHandler, instance, ...rest
  } = { ...DEFAULT_APP_THEME_INIT_OPTIONS, ...options }

  let preparedInstance: AppThemeDriverInstance
  if (isUndefined(instance)) {
    preparedInstance = makeAppThemeDriver({ ...driverOptions, ...rest })
  } else {
    preparedInstance = instance
  }

  const {
    theme, preferredColorScheme, preferredLightSource
  } = preparedInstance.outputs

  preferredColorScheme.subscribeValue(preferredColorSchemeHandler)
  preferredLightSource.subscribeValue(preferredLightSourceHandler)
  theme.subscribeValue(themeHandler)

  return {
    appThemeDriver: preparedInstance
  }
}
