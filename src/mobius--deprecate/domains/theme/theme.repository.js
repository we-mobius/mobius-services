import { getPropByPath } from '../../libs/mobius-utils.js'
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

const saveTo = () => getPropByPath('theme.saveTo', repositoryConfig)
const isSaveToServer = () => saveTo() === 'server'
const isSaveToLocal = () => saveTo() === 'local'
const isSaveToRuntime = () => saveTo() === 'runtime'

// saveToServer: Server ?-> Local ? DOM ? CSS ? Default
// saveToLocal: Local ? DOM ? CSS ? Default
// saveToRuntime: DOM ? CSS ? Default
const getMode = async () => {
  let mode

  if (isSaveToRuntime()) {
    mode = getModeFromDOM() ? getModeFromDOM()
      : getModeFromCSS() ? getModeFromCSS()
        : getModeFromDefault()
  }

  if (isSaveToLocal()) {
    mode = getModeFromLocal() ? getModeFromLocal()
      : getModeFromDOM() ? getModeFromDOM()
        : getModeFromCSS() ? getModeFromCSS()
          : getModeFromDefault()
  }

  if (isSaveToServer()) {
    mode = await getModeFromServer()
    mode && setModeToLocal(mode)
    mode = getModeFromLocal() ? getModeFromLocal()
      : getModeFromDOM() ? getModeFromDOM()
        : getModeFromCSS() ? getModeFromCSS()
          : getModeFromDefault()
  }

  return mode
}
const getLightSource = async () => {
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
    lightSource = getLightSourceFromServer()
    lightSource && setLightSourceToLocal(lightSource)
    lightSource = getLightSourceFromLocal() ? getLightSourceFromLocal()
      : getLightSourceFromDOM() ? getLightSourceFromDOM()
        : getLightSourceFromDefault()
  }

  return lightSource
}
// saveToServer: Server ?-> Local
// saveToLocal: Local
// saveToRuntime: nowhere
const setMode = async mode => {
  if (isSaveToServer()) {
    setModeToServer(mode)
    setModeToLocal(mode)
  }
  if (isSaveToLocal()) {
    setModeToLocal(mode)
  }
  if (isSaveToRuntime()) {
    // do nothing
  }
}
const setLightSource = async lightSource => {
  if (isSaveToServer()) {
    setLightSourceToServer(lightSource)
    setLightSourceToLocal(lightSource)
  }
  if (isSaveToLocal()) {
    setLightSourceToLocal(lightSource)
  }
  if (isSaveToRuntime()) {
    // do nothing
  }
}

const modeOut$ = new Observable(observer => {
  getMode().then(mode => {
    observer.next(makeThemeModeCurrency(mode))
    observer.complete()
  })
})
const lightSourceOut$ = new Observable(observer => {
  getLightSource().then(lightSource => {
    observer.next(makeThemeLightSourceCurrency(lightSource))
    observer.complete()
  })
})

const modeIn$ = {
  next: modeCurrency => {
    setMode(modeCurrency.value)
  },
  error: () => {},
  complete: () => {}
}
const lightSourceIn$ = {
  next: lightSourceCurrency => {
    setLightSource(lightSourceCurrency.value)
  },
  error: () => {},
  complete: () => {}
}

export {
  modeIn$, modeOut$,
  lightSourceIn$, lightSourceOut$
}
