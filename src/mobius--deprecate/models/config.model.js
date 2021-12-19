import { perf, deepMerge, deepCopy } from '../libs/mobius-utils.js'
import { defaultConfig } from '../config/index.js'
import { reactive, effect } from '../libs/reactivity.js'

const defaultConfigProxy = reactive(defaultConfig)

const changeConfig = configChanges => {
  console.log(`[${perf.now}][ConfigModel] changeConfig: runtimeConfig changes received...`, configChanges)
  configChanges = configChanges || {}
  deepMerge(defaultConfigProxy, configChanges)
}

const onConfigChange = handler => {
  console.log(`[${perf.now}][ConfigModel] onConfigChange: onConfigChange registered (runtimeConfig mutation will be executed once)...`)
  effect(() => {
    console.log(`[${perf.now}][ConfigModel] onConfigChange: runtimeConfig mutation executed...`, defaultConfigProxy)
    handler(deepCopy(defaultConfigProxy))
  })
}

export { changeConfig, onConfigChange }
