import { hardDeepMerge, deepCopy, isEmptyObj, emptifyObj } from '../utils/index.js'
import { mpAuthState } from '../config/index.js'
import { reactive, effect } from '../libs/reactivity.js'

const authStateProxy = reactive(mpAuthState)

const changeAuthState = changes => {
  if (isEmptyObj(changes)) {
    emptifyObj(authStateProxy)
  } else {
    hardDeepMerge(authStateProxy, changes)
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
