import { deepCopy, isString, isObject } from '../utils/index.js'
import axios from 'axios'

const asIs = sth => sth
const makeCustomBiutor = (configHandler = asIs, responseHandler = asIs) => {
  return config => {
    const _config = configHandler(config)
    return new Promise((resolve, reject) => {
      axios(_config)
        .then(res => {
          resolve(responseHandler(res))
        })
        .catch(reject)
    })
  }
}

const makeInnerBiutor = () => {
  const innerBiuConfigInjectorSet = new Set()
  const addInnerBiuInjector = handler => {
    innerBiuConfigInjectorSet.add(handler)
  }
  const innerBiu = makeCustomBiutor(config => {
    let cfg = deepCopy(config)
    innerBiuConfigInjectorSet.forEach(handler => {
      cfg = handler(cfg)
    })
    return cfg
  })

  return {
    maker: makeInnerBiutor,
    biu: innerBiu,
    addConfigInjector: addInnerBiuInjector
  }
}

// Biu.scope('inner').biu({})
// Biu.scope('inner.auth').biu({})
const Biu = (() => {
  const biuMap = new Map()

  return {
    initScope: (scope, biutor) => {
      const _biutor = biuMap.get(scope)
      if (_biutor) {
        return _biutor
      }
      if (isObject(biutor)) {
        biuMap.set(scope, biutor)
      }
      if (isString(biutor)) {
        biuMap.set(scope, biuMap.get(biutor).maker())
      }
    },
    scope: scope => {
      if (!isString(scope)) {
        throw Error('[libs/axios.js(custom)] only accept string arg')
      }
      return biuMap.get(scope)
    }
  }
})()

Biu.initScope('inner', makeInnerBiutor())

export {
  axios,
  Biu,
  makeCustomBiutor
}
