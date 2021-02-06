import { perf } from '../libs/mobius-utils.js'
import { reactive, effect } from '../libs/reactivity.js'

const theme = {
  mode: '',
  lightSource: ''
}

const themeProxy = reactive(theme)

const changeMode = mode => {
  console.log(`[${perf.now}][ThemeModel] changeMode: received mode changes...`, mode)
  themeProxy.mode = mode
  return themeProxy.mode === mode
}

const changeLightSource = lightSource => {
  console.log(`[${perf.now}][ThemeModel] changeLightSource: received lightSource changes...`, lightSource)
  themeProxy.lightSource = lightSource
  return themeProxy.lightSource === lightSource
}

const onModeChange = handler => {
  effect(() => {
    console.log(`[${perf.now}][ThemeModel] onModeChange: runtimeThemeMode mutation executed...`, themeProxy.mode)
    handler(themeProxy.mode)
  })
}

const onLightSourceChange = handler => {
  effect(() => {
    console.log(`[${perf.now}][ThemeModel] onLightSourceChange: runtimeThemeLightSource mutation executed...`, themeProxy.lightSource)
    handler(themeProxy.lightSource)
  })
}

export { changeMode, changeLightSource, onModeChange, onLightSourceChange }
