import { get } from '../../libs/mobius-utils.js'
import { repositoryConfig, authingAuthState } from '../../config/index.js'
import { Subject, Observable } from '../../libs/rx.js'
import {
  getAuthStateFromLocal, setAuthStateToLocal,
  register, login, userInfo, logout
} from '../../data/authing.auth.data.js'

// keep config fresh
const saveTo = () => get(repositoryConfig, 'auth.authing.saveTo')
const isSaveToLocal = () => saveTo() === 'local'
const isSaveToRuntime = () => saveTo() === 'runtime'

const getAuthState = () => {
  let _authState
  if (isSaveToLocal()) {
    _authState = getAuthStateFromLocal()
  }
  if (isSaveToRuntime()) {
    _authState = authingAuthState
  }
  return _authState
}
const setAuthState = (authState) => {
  if (isSaveToLocal()) {
    setAuthStateToLocal(authState)
  }
  if (isSaveToRuntime()) {
    // Just do nothing.
    // Reactivity in AuthModel will handle!
  }
}

const registerIn$ = {
  next: (options) => {
    return register(options).then(authState => {
      registerOut$.next(authState)
    })
  },
  error: () => {},
  complete: () => {}
}
const registerOut$ = new Subject()

const loginIn$ = {
  next: (options) => {
    return login(options).then(authState => {
      loginOut$.next(authState)
    })
  },
  error: () => {},
  complete: () => {}
}
const loginOut$ = new Subject()

const userInfoIn$ = {
  next: () => {
    return userInfo().then(userInfo => {
      userInfoOut$.next(userInfo)
    })
  },
  error: () => {},
  complete: () => {}
}
const userInfoOut$ = new Subject()

const logoutIn$ = {
  next: () => {
    return logout().then(() => {
      logoutOut$.next({})
    }).catch(err => {
      console.info(err)
      logoutOut$.next({})
    })
  },
  error: () => {},
  complete: () => {}
}
const logoutOut$ = new Subject()

const authStateIn$ = {
  next: authState => {
    setAuthState(authState)
  },
  error: () => {},
  complete: () => {}
}
const authStateOut$ = new Observable(observer => {
  const authState = getAuthState()
  observer.next(authState)
  observer.complete()
})

export {
  registerIn$, registerOut$,
  loginIn$, loginOut$,
  userInfoIn$, userInfoOut$,
  logoutIn$, logoutOut$,
  authStateIn$, authStateOut$
}
