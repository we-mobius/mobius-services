const THEME = {
  TYPE: {
    MODE: 'mode',
    LIGHTSOURCE: 'lightSource'
  },
  MODE: {
    DEFAULT: 'light',
    DARK: 'dark',
    LIGHT: 'light'
  },
  LIGHTSOURCE: {
    LT_RB: 'lt2rb',
    RT_LB: 'rt2lb',
    RB_LT: 'rb2lt',
    LB_RT: 'lb2rt'
  },
  CONTROL: {
    AUTOTOGGLE: {
      OPEN: 'open',
      CLOSE: 'close'
    }
  }
}

const isValidType = type => Object.values(THEME.TYPE).includes(type)
const isValidMode = mode => Object.values(THEME.MODE).includes(mode)
const isValidLightSource = lightSource => Object.values(THEME.LIGHTSOURCE).includes(lightSource)
const makeModeCurrency = mode => {
  if (isValidMode(mode)) {
    return { type: THEME.TYPE.MODE, value: mode }
  } else {
    throw Error(`传入的 Mode 值无效，传入值为: ${mode}`)
  }
}
const makeLightSourceCurrency = lightSource => {
  if (isValidLightSource(lightSource)) {
    return { type: THEME.TYPE.LIGHTSOURCE, value: lightSource }
  } else {
    throw Error(`传入的 LightSource 值无效，传入值为 ${lightSource}`)
  }
}
const isModeCurrency = currency => currency.type === THEME.TYPE.MODE
const isLightSourceCurrency = currency => currency.type === THEME.TYPE.LIGHTSOURCE

export {
  THEME,
  isValidType as isValidThemeType,
  isValidMode as isValidThemeMode,
  isValidLightSource as isValidThemeLightSource,
  makeModeCurrency as makeThemeModeCurrency,
  makeLightSourceCurrency as makeThemeLightSourceCurrency,
  isModeCurrency as isThemeModeCurrency,
  isLightSourceCurrency as isThemeLightSourceCurrency
}
