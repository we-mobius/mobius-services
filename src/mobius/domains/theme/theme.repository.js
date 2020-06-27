import { get } from '../../utils/index.js'
import {
  makeThemeModeCurrency, makeThemeLightSourceCurrency
} from '../../const/index.js'
import { repositoryConfig } from '../../config/index.js'
import { Observable } from '../../libs/rx.js'
import {
  getModeFromServer, setModeToServer,
  getModeFromLocal, setModeToLocal,
  getModeFromCSS,
  getModeFromDOM,
  getModeFromDefault,
  getLightSourceFromServer, setLightSourceToServer,
  getLightSourceFromLocal, setLightSourceToLocal,
  getLightSourceFromDOM,
  getLightSourceFromDefault
} from '../../data/theme.data.js'

const saveTo = () => get(repositoryConfig, 'theme.saveTo')
const isSaveToServer = () => saveTo() === 'sever'
const isSaveToLocal = () => saveTo() === 'local'
const isSaveToRuntime = () => saveTo() === 'runtime'

// saveToServer: Server ?-> Local ? CSS ? DOM ? Default
// saveToLocal: Local ? CSS ? DOM ? Default
// saveToRuntime: CSS ? DOM ? Default
const getMode = () => {
  let mode

  if (isSaveToRuntime()) {
    mode = getModeFromCSS() ? getModeFromCSS()
      : getModeFromDOM() ? getModeFromDOM()
        : getModeFromDefault()
  }

  if (isSaveToLocal()) {
    mode = getModeFromLocal() ? getModeFromLocal()
      : getModeFromCSS() ? getModeFromCSS()
        : getModeFromDOM() ? getModeFromDOM()
          : getModeFromDefault()
  }

  if (isSaveToServer()) {
    mode = getModeFromServer()
    mode && setModeToLocal(mode)
    mode = getModeFromLocal() ? getModeFromLocal()
      : getModeFromCSS() ? getModeFromCSS()
        : getModeFromDOM() ? getModeFromDOM()
          : getModeFromDefault()
  }

  return mode
}
const getLightSource = () => {
  let lightSource

  if (isSaveToRuntime()) {
    lightSource = getLightSourceFromDOM() ? getLightSourceFromDOM()
      : getLightSourceFromDefault()
  }

  if (isSaveToLocal()) {
    lightSource = getLightSourceFromLocal() ? getLightSourceFromLocal()
      : getLightSourceFromDOM() ? getLightSourceFromDOM()
        : getLightSourceFromDefault()
  }

  if (isSaveToServer()) {
    lightSource = getLightSourceFromLocal()
    lightSource || setLightSourceToLocal(getLightSourceFromServer())
    lightSource = getLightSourceFromLocal() ? getLightSourceFromLocal()
      : getLightSourceFromDOM() ? getLightSourceFromDOM()
        : getLightSourceFromDefault()
  }

  return lightSource
}
// saveToServer: Server ?-> Local
// saveToLocal: Local
// saveToRuntime: nowhere
const setMode = mode => {
  if (isSaveToServer()) {
    setModeToServer(mode)
    setModeToLocal(getModeFromServer())
  }
  if (isSaveToLocal()) {
    setModeToLocal(mode)
  }
  if (isSaveToRuntime()) {
    // do nothing
  }
}
const setLightSource = lightSource => {
  if (isSaveToServer()) {
    setLightSourceToServer(lightSource)
    setLightSourceToLocal(getLightSourceFromServer())
  }
  if (isSaveToLocal()) {
    setLightSourceToLocal(lightSource)
  }
  if (isSaveToRuntime()) {
    // do nothing
  }
}

const modeOut$ = new Observable(observer => {
  const mode = getMode()
  observer.next(makeThemeModeCurrency(mode))
  // observer.complete()
})
const lightSourceOut$ = new Observable(observer => {
  const lightSource = getLightSource()
  observer.next(makeThemeLightSourceCurrency(lightSource))
  // observer.complete()
})

const modeIn$ = {
  next: (modeCurrency) => {
    setMode(modeCurrency.value)
  },
  error: () => {},
  complete: () => {}
}
const lightSourceIn$ = {
  next: (lightSourceCurrency) => {
    setLightSource(lightSourceCurrency.value)
  },
  error: () => {},
  complete: () => {}
}

export {
  modeIn$, modeOut$,
  lightSourceIn$, lightSourceOut$
}
