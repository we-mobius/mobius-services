import {
  isString, isObject, isFunction, asIs, hasOwnProperty,
  hardDeepMerge, get,
  flip, composeL, allPass,
  makeErrorResponse, formatResponse
} from '../utils/index.js'
import { adaptMultiPlatform } from '../common/index'
import { wxmina } from './wx.js'
import axios from 'axios'

export { axios }

/***************************************************************
 *                            biu
 ***************************************************************/

const _commonDefaultConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
}
// biu(config)
// biu(modifier, config)
// biu(config, modifier)
export const biu = (config, _) => {
  if (isFunction(_)) {
    config = _(config || {})
  }
  if (isFunction(config)) {
    config = config(_ || {})
  }
  if (!isObject(config)) {
    throw TypeError('Config is expected to be an object, please check your config or config modifier whick should return an config object.')
  }
  config = { ..._commonDefaultConfig, ...config }
  return new Promise((resolve, reject) => {
    adaptMultiPlatform({
      webFn: () => {
        axios({
          ...config
        })
          .then(resolve)
          .catch(reject)
      },
      wxminaFn: () => {
        try {
          // @see https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html
          wxmina.request({
            dataType: 'json',
            responseType: 'text',
            ...config,
            header: {
              ...(config.headers || {})
            },
            success: resolve,
            fail: reject
          })
        } catch (e) {
          reject(e)
        }
      }
    })
  })
    .then(res => {
      if (!config.withDataExtracted) return res
      const data = res.data
      if (!data) return makeErrorResponse('There is no "data" field in request response.')
      // TODO: 适配多接口返回值捆绑的情况
      if (isObject(data)) {
        const type = get(config, 'data.payload.type')
        const actualData = get(data, `data.${type}`)
        if (type && actualData) {
          data.data = actualData
        }
      }
      return formatResponse(data)
    })
    .then(res => {
      const responseModifier = config.responseModifier || asIs
      return responseModifier(res)
    })
    .catch(formatResponse)
}
export const modifyBiuConfig = flip(hardDeepMerge)
// biu(equiped(asPostRequest)({ url: 'https://example.com' }))
// biu(equiped(asPostRequest), { url: 'https://example.com' })
// biu({ url: 'https://example.com' }, equiped(asPostRequest))
export const asPostRequest = modifyBiuConfig({ method: 'POST' })
export const asGetRequest = modifyBiuConfig({ method: 'GET' })
export const withJSONContent = modifyBiuConfig({ headers: { 'Content-Type': 'application/json' } })
export const withCredentials = modifyBiuConfig({ withCredentials: true })
export const withoutCredentials = modifyBiuConfig({ withCredentials: false })

export const withDataExtracted = modifyBiuConfig({ withDataExtracted: true })

/***************************************************************
 *                          Biutor
 ***************************************************************/

export const isBiutor = allPass([isObject, hasOwnProperty('maker'), hasOwnProperty('biu')])
export const makeCustomBiutor = (configModifier, responseModifier) => {
  configModifier = configModifier || asIs
  responseModifier = responseModifier || asIs
  return {
    maker: makeCustomBiutor,
    configModifier: configModifier,
    responseModifier: responseModifier,
    biu: config => biu(configModifier(config)).then(responseModifier)
  }
}

export const makeFutureBiutor = () => {
  const configModifiers = new Set()
  const addConfigModifier = configModifiers.add.bind(configModifiers)
  const responseModifiers = new Set()
  const addResponseModifier = responseModifiers.add.bind(responseModifiers)
  const innerBiutor = makeCustomBiutor(
    composeL(...configModifiers),
    composeL(...responseModifiers)
  )

  return {
    ...innerBiutor,
    maker: makeFutureBiutor,
    biu: innerBiutor.biu,
    addConfigModifier: addConfigModifier,
    addResponseModifier: addResponseModifier
  }
}

// Biu.scope('inner').biu({})
// Biu.scope('inner.auth').biu({})
export const Biu = (() => {
  const biutorMap = new Map()

  return {
    registerScope: (scope, biutor) => {
      const _biutor = biutorMap.get(scope)
      if (_biutor) return _biutor
      if (isBiutor(biutor)) {
        biutorMap.set(scope, biutor)
      }
      // use biutor to create new biutor
      if (isString(biutor)) {
        biutorMap.set(scope, biutorMap.get(biutor).maker())
      }
    },
    scope: scope => biutorMap.get(scope)
  }
})()

Biu.registerScope('inner', makeFutureBiutor())
Biu.registerScope('default', makeCustomBiutor())
