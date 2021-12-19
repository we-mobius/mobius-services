import { deepMerge, deepCopy, isEmptyObj, emptifyObj } from '../libs/mobius-utils.js'
import { authingAuthState } from '../config/index.js'
import { reactive, effect } from '../libs/reactivity.js'

const authStateProxy = reactive(authingAuthState)

const changeAuthState = changes => {
  if (isEmptyObj(changes)) {
    emptifyObj(authStateProxy)
  } else {
    deepMerge(authStateProxy, changes)
  }
  return deepCopy(authStateProxy)
}
const onAuthStateChange = handler => {
  effect(() => {
    handler(deepCopy(authStateProxy))
  })
}

export {
  changeAuthState, onAuthStateChange
}
