import {
  initAuthingAuth,
  authingAuthObservers, authingAuthObservables
} from './authing.auth.service.js'
import {
  initMpAuth, mpAuthObservers, mpAuthObservables,
  getMpAuthCode
} from './mp.auth.service.js'

const initAuth = async (...arg) => {
  await initAuthingAuth(...arg)
}
const authObservers = authingAuthObservers
const authObservables = authingAuthObservables

export {
  initAuthingAuth, authingAuthObservers, authingAuthObservables,
  initMpAuth, mpAuthObservers, mpAuthObservables, getMpAuthCode,
  initAuth, authObservers, authObservables
}
