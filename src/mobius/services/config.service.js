import { perf, get } from '../utils/index.js'
import { defaultConfig } from '../config/index.js'
import { makeConfigObserver, configObservables } from '../drivers/config.driver.js'

const initConfig = configChanges => {
  return new Promise(resolve => {
    // 1. subscrive mutations first to reserve future changes
    console.log(`[${perf.now}][ConfigService] initConfig: subscribe to configObservables.mutation()...`)
    configObservables.mutation().subscribe(config => {
      console.log(`[${perf.now}][ConfigService] configObservables.mutation() received config...`, config)
    })
    resolve('done')
  }).then(() =>
    new Promise(resolve => {
    // 2. subscribe to init to run the first config getter
    //      -> feed first config back to ConfigSystem to
    //         synchronize configs(defaultConfig, runtimeConfig...)
      console.log(`[${perf.now}][ConfigService] initConfig: subscribe to configObservables.init()...`)
      configObservables.init().subscribe(config => {
        console.log(`[${perf.now}][ConfigService] initConfig: configObservables.init() received initial config...`, config)
        makeConfigObserver().next(config)
        resolve('done')
      })
    })
  ).then(() =>
    new Promise(resolve => {
      // 3. update hybrid observable's replay to newest
      console.log(`[${perf.now}][ConfigService] initConfig: subscribe to configObservables.hybrid()...`)
      configObservables.hybrid().subscribe(config => {
        console.log(`[${perf.now}][ConfigService] initConfig: configObservables.hybrid() received config...`, config)
      })
      resolve('done')
    })
  ).then(() =>
    new Promise(resolve => {
      // 4. merge developer's config in
      console.log(`[${perf.now}][ConfigService] initConfig: merge developer's config in...`, configChanges)
      makeConfigObserver().next(configChanges || {})
      resolve('done')
    })
  )
}

const getConfig = path => get(defaultConfig, path)

export { makeConfigObserver, configObservables, initConfig, getConfig }
