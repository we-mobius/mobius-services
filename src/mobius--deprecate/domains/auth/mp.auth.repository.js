import {
  Observable, Subject
} from '../../libs/rx.js'
import {
  getAuthStateFromLocal, setAuthStateToLocal,
  login, userInfo
} from '../../data/mp.auth.data.js'

const getAuthState = () => getAuthStateFromLocal()
const setAuthState = setAuthStateToLocal

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

const loginIn$ = {
  next: options => {
    login(options).then(authState => {
      loginOut$.next(authState || {})
    })
  },
  error: () => {},
  complete: () => {}
}
const loginOut$ = new Subject()

const logoutIn$ = {
  next: () => {
    loginOut$.next({})
  },
  error: () => {},
  complete: () => {}
}
const logoutOut$ = new Subject()

const userInfoIn$ = {
  next: options => {
    userInfo(options).then(userInfo => {
      userInfoOut$.next(userInfo || {})
    })
  },
  error: () => {},
  complete: () => {}
}
const userInfoOut$ = new Subject()

export {
  authStateIn$, authStateOut$,
  loginIn$, loginOut$,
  logoutIn$, logoutOut$,
  userInfoIn$, userInfoOut$
}
