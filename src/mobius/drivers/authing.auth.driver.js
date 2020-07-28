import {
  AUTH,
  isValidAuthType, isEmptyAuthState
} from '../const/index.js'
import {
  Subject, merge,
  debounceTime,
  tap, map, filter, shareReplay
} from '../libs/rx.js'
import { makeObservableSeletor } from '../common/index.js'
import {
  registerIn$, registerOut$,
  loginIn$, loginOut$,
  userInfoIn$, userInfoOut$,
  logoutIn$, logoutOut$,
  authStateIn$, authStateOut$
} from '../domains/auth/authing.auth.repository.js'
import { changeAuthState, onAuthStateChange } from '../models/authing.auth.model.js'

/******************************************
 *                  Input
 ******************************************/

const _observersMap = new Map([
  [AUTH.TYPE.REGISTER, registerIn$],
  [AUTH.TYPE.LOGIN, loginIn$],
  [AUTH.TYPE.LOGOUT, logoutIn$],
  [AUTH.TYPE.USERINFO, userInfoIn$],
  [AUTH.TYPE.AUTHSTATE, authStateIn$]
])
const observers = {
  select: type => {
    let res
    if (isValidAuthType(type)) {
      res = _observersMap.get(type)
    } else {
      throw Error(`传入的 AuthType 无效，传入值为 ${type}`)
    }
    return res
  }
}

/******************************************
 *                  Output
 ******************************************/

const authStateMutationOut$ = new Subject()

merge(registerOut$, loginOut$, userInfoOut$, logoutOut$)
  .subscribe(authStateChanges => {
    changeAuthState(authStateChanges)
  })

const authStateInitOut$ = authStateOut$.pipe(
  map(changeAuthState),
  tap(authState => {
    // make sure authStateOutShare$ will have initial value
    // even if the initial AuthState is empty
    authStateMutationOut$.next(authState)
  })
)
const authStateOutShare$ = merge(
  authStateInitOut$,
  authStateMutationOut$
).pipe(
  debounceTime(200),
  tap(authState => {
    authStateIn$.next(authState)
  }),
  shareReplay(1)
)

onAuthStateChange(authState => {
  authStateMutationOut$.next(authState)
})

const observables = {
  init: () => authStateInitOut$,
  hybrid: () => authStateOutShare$,
  empty: () => authStateOutShare$.pipe(
    filter(authState => isEmptyAuthState(authState))
  ),
  select: makeObservableSeletor(authStateOutShare$).select
}

export {
  observers as authingAuthObservers,
  observables as authingAuthObservables
}
