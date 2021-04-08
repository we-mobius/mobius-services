import { deepCopy } from '../libs/mobius-utils.js'
import { INIT_CONFIG } from '../const/config.const.js'
export * from './auth.config.js'

const utilConfig = deepCopy(INIT_CONFIG.util)
const commonConfig = deepCopy(INIT_CONFIG.common)

const configConfig = deepCopy(INIT_CONFIG.config)
const constConfig = deepCopy(INIT_CONFIG.const)

const libConfig = deepCopy(INIT_CONFIG.lib)
const dataConfig = deepCopy(INIT_CONFIG.data)
const domainConfig = deepCopy(INIT_CONFIG.domain)
const repositoryConfig = deepCopy(INIT_CONFIG.repository)
const usecaseConfig = deepCopy(INIT_CONFIG.usecase)
const modelConfig = deepCopy(INIT_CONFIG.model)
const driverConfig = deepCopy(INIT_CONFIG.driver)

const serviceConfig = deepCopy(INIT_CONFIG.service)

const adapterConfig = deepCopy(INIT_CONFIG.adapter)
const presenterConfig = deepCopy(INIT_CONFIG.presenter)
const enhancementConfig = deepCopy(INIT_CONFIG.enhancement)

const defaultConfig = {
  util: utilConfig,
  common: commonConfig,
  config: configConfig,
  const: constConfig,
  lib: libConfig,
  data: dataConfig,
  domain: domainConfig,
  repository: repositoryConfig,
  usecase: usecaseConfig,
  model: modelConfig,
  driver: driverConfig,
  service: serviceConfig,
  adapter: adapterConfig,
  presenter: presenterConfig,
  enhancement: enhancementConfig
}

export {
  utilConfig,
  commonConfig,
  configConfig,
  constConfig,
  libConfig,
  dataConfig,
  domainConfig,
  repositoryConfig,
  usecaseConfig,
  modelConfig,
  driverConfig,
  serviceConfig,
  adapterConfig,
  presenterConfig,
  enhancementConfig,

  defaultConfig
}
