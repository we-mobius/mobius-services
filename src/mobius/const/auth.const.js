import { isEmptyObj, isOutDated } from '../utils/index.js'

const AUTH = {
  TYPE: {
    REGISTER: 'register',
    LOGIN: 'login',
    LOGOUT: 'logout',
    USERINFO: 'userinfo',
    AUTHSTATE: 'authstate'
  }
}

const isValidAuthType = type => Object.values(AUTH.TYPE).includes(type)

const isEmptyAuthState = authState => isEmptyObj(authState)
const hasToken = ({ token, tokenExpiredAt }) => token && tokenExpiredAt

const isSeemsVaildToken = ({ token, tokenExpiredAt }) =>
  hasToken({ token, tokenExpiredAt }) && !isOutDated(tokenExpiredAt)
const isSeemsVaildAuthState = authState =>
  !isEmptyAuthState(authState) && isSeemsVaildToken(authState)

export {
  AUTH,
  isValidAuthType,
  isEmptyAuthState,
  hasToken, isSeemsVaildToken,
  isSeemsVaildAuthState
}
