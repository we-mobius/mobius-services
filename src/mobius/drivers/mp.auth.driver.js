import {
  AUTH,
  isValidAuthType
} from '../const/index.js'
import {
  Subject, merge,
  debounceTime,
  tap, map, shareReplay
} from '../libs/rx.js'
import { makeObservableSeletor } from '../common/index.js'
import {
  authStateIn$, authStateOut$,
  loginIn$, loginOut$,
  logoutIn$, logoutOut$,
  userInfoIn$, userInfoOut$
} from '../domains/auth/mp.auth.repository.js'
import {
  changeAuthState, onAuthStateChange
} from '../models/mp.auth.model.js'

/******************************************
 *                  Input
 ******************************************/

const _observersMap = new Map([
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

const authStateInitOut$ = new Subject()
const authStateMutationOut$ = new Subject()

merge(loginOut$, logoutOut$)
  .subscribe(authStateChanges => {
    changeAuthState(authStateChanges)
  })

onAuthStateChange(authState => {
  authStateMutationOut$.next(authState)
})

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

const userInfoInitOut$ = new Subject()
const userInfoMutationOut$ = new Subject()
const userInfoOutShare$ = merge(userInfoOut$, userInfoInitOut$, userInfoMutationOut$).pipe(
  shareReplay(1)
)

const observables = {
  trigger: type => {
    let res
    switch (type) {
      case 'auth_state':
        res = authStateOut$.pipe(
          map(changeAuthState),
          tap(authState => {
            // make sure authStateOutShare$ will have initial value
            // even if the initial AuthState is empty
            authStateMutationOut$.next(authState)
          })
        )
        break
    }
    if (!res) throw Error('Expected type of mpAPIObservables: auth_state ...')
    return res
  },
  type: type => {
    let res
    switch (type) {
      case 'auth_state':
        res = makeObservableSeletor(authStateOutShare$)
        break
      case 'user_info':
        res = makeObservableSeletor(userInfoOutShare$)
        break
    }
    if (!res) throw Error('Expected type of mpAuthObservables: auth_state|user_info ...')
    return res
  }
}

export {
  observers as mpAuthObservers,
  observables as mpAuthObservables
}
