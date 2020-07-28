import { asIs, deepCopy, isString, isObject } from '../utils/index.js'
import { adaptMultiPlatform } from '../common/index'
import { wxmina } from './wx.js'
import axios from 'axios'

const makeCustomBiutor = (configHandler = asIs, responseHandler = asIs) => {
  return {
    maker: makeCustomBiutor,
    biu: config => {
      const _config = configHandler(config)
      return new Promise((resolve, reject) => {
        adaptMultiPlatform({
          webFn: () => {
            axios(_config)
              .then(response => {
                resolve(responseHandler(response))
              })
              .catch(reject)
          },
          wxminaFn: () => {
            try {
              // @see https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html
              wxmina.request({
                dataType: 'json',
                responseType: 'text',
                header: _config.headers,
                ..._config,
                success: response => {
                  resolve(responseHandler(response))
                },
                fail: reject
              })
            } catch (e) {
              reject(e)
            }
          }
        })
      })
    }
  }
}

const makeInnerBiutor = () => {
  const innerBiuConfigInjectorSet = new Set()
  const addInnerBiuInjector = handler => {
    innerBiuConfigInjectorSet.add(handler)
  }
  const innerBiutor = makeCustomBiutor(config => {
    let cfg = deepCopy(config)
    innerBiuConfigInjectorSet.forEach(handler => {
      cfg = handler(cfg)
    })
    return cfg
  })

  return {
    maker: makeInnerBiutor,
    biu: innerBiutor.biu,
    addConfigInjector: addInnerBiuInjector
  }
}

// Biu.scope('inner').biu({})
// Biu.scope('inner.auth').biu({})
const Biu = (() => {
  const biutorMap = new Map()

  return {
    registerScope: (scope, biutor) => {
      const _biutor = biutorMap.get(scope)
      if (_biutor) {
        return _biutor
      }
      if (isObject(biutor)) {
        biutorMap.set(scope, biutor)
      }
      // use biutor to create new biutor
      if (isString(biutor)) {
        biutorMap.set(scope, biutorMap.get(biutor).maker())
      }
    },
    scope: scope => {
      if (!isString(scope)) {
        throw Error('[libs/axios.js(custom)] only accept string arg')
      }
      return biutorMap.get(scope)
    }
  }
})()

Biu.registerScope('inner', makeInnerBiutor())
Biu.registerScope('default', makeCustomBiutor())

export {
  axios,
  Biu,
  makeCustomBiutor
}
