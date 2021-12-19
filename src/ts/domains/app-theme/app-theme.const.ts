
import {
  PreferredColorScheme as AppThemePreferredColorScheme, PreferredLightSource as AppThemePreferredLightSource
} from '../../data/theme.data'

export { AppThemePreferredColorScheme, AppThemePreferredLightSource }

export interface AppTheme {
  preferredColorScheme: AppThemePreferredColorScheme
  preferredLightSource: AppThemePreferredLightSource
}

export const DEFAULT_APP_THEME: AppTheme = {
  preferredColorScheme: AppThemePreferredColorScheme.Unknown,
  preferredLightSource: AppThemePreferredLightSource.Unknown
}
