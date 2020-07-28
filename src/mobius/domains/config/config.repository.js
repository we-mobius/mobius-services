import { get } from '../../utils/index.js'
import { repositoryConfig } from '../../config/index.js'
import { Observable } from '../../libs/rx.js'
import {
  getConfigFromServer, setConfigToServer,
  getConfigFromLocal, setConfigToLocal,
  getConfigFromDefault, setConfigToDefault
} from '../../data/config.data.js'

// keep config fresh
const saveTo = () => get(repositoryConfig, 'config.saveTo')
const isSaveToServer = () => saveTo() === 'server'
const isSaveToLocal = () => saveTo() === 'local'
const isSaveToRuntime = () => saveTo() === 'runtime'

// saveToServer: Server ?-> Local ? Default
// saveToLocal: Local ? Default
// saveToRuntime: Default
const getConfig = async () => {
  let config

  if (isSaveToRuntime()) {
    config = getConfigFromDefault()
  }

  if (isSaveToLocal()) {
    config = getConfigFromLocal() ? getConfigFromLocal()
      : getConfigFromDefault()
  }

  if (isSaveToServer()) {
    config = await getConfigFromServer()
    console.warn(config)
    config && setConfigToLocal(config)
    config = getConfigFromLocal() ? getConfigFromLocal()
      : getConfigFromDefault()
  }

  return config
}
// saveToServer: Server ?-> Local
// saveToLocal: Local
// saveToRuntime: nowhere
const setConfig = async (config) => {
  if (isSaveToServer()) {
    await setConfigToServer(config)
    setConfigToLocal(await getConfigFromServer() || config)
  }
  if (isSaveToLocal()) {
    setConfigToLocal(config)
  }
  if (isSaveToRuntime()) {
    // NOTE: actually do nothing in case polute `defaultConfig`
    // @see ConfigData
    setConfigToDefault(config)
  }
}

const configOut$ = new Observable(observer => {
  getConfig().then(config => {
    observer.next(config)
    observer.complete()
  })
})
const configIn$ = {
  next: (config) => {
    setConfig(config)
  },
  error: () => {},
  complete: () => {}
}

const serverConfig$ = new Observable(observer => {
  getConfigFromServer().then(config => {
    observer.next(config)
    observer.complete()
  })
})

export {
  configOut$, configIn$,
  serverConfig$
}
