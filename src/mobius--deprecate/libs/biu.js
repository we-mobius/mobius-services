import {
  isString, isObject, asIs, hasOwnProperty,
  composeL, allPass,
  biu, axios
} from '../libs/mobius-utils.js'

export { axios }

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
