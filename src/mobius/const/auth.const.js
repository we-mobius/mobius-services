import { isEmptyObj, isOutDated } from '../utils/index.js'

/*****************************************
 *              Common Auth Const
 *****************************************/
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

/*****************************************
 *          Authing Auth Const
 *****************************************/

const hasAuthingToken = ({ token, tokenExpiredAt }) => token && tokenExpiredAt

const isSeemsVaildAuthingToken = ({ token, tokenExpiredAt }) =>
  hasAuthingToken({ token, tokenExpiredAt }) && !isOutDated(tokenExpiredAt)
const isSeemsVaildAuthingAuthState = authState =>
  !isEmptyAuthState(authState) && isSeemsVaildAuthingToken(authState)

/*****************************************
 *              Mp Auth Const
 *****************************************/

const isValidMpAuthState = authState =>
  !isEmptyAuthState(authState) && authState.expires_at && !isOutDated(authState.expires_at)

export {
  AUTH,
  isValidAuthType, isEmptyAuthState,
  hasAuthingToken, isSeemsVaildAuthingToken, isSeemsVaildAuthingAuthState,
  isValidMpAuthState
}
