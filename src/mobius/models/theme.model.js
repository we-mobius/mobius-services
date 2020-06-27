import { reactive, effect } from '../libs/reactivity.js'

const theme = {
  mode: '',
  lightSource: ''
}

const themeProxy = reactive(theme)

const changeMode = mode => {
  themeProxy.mode = mode
  return themeProxy.mode === mode
}

const changeLightSource = lightSource => {
  themeProxy.lightSource = lightSource
  return themeProxy.lightSource === lightSource
}

const onModeChange = handler => {
  effect(() => {
    handler(themeProxy.mode)
  })
}

const onLightSourceChange = handler => {
  effect(() => {
    handler(themeProxy.lightSource)
  })
}

export { changeMode, changeLightSource, onModeChange, onLightSourceChange }
