import { perf } from '../utils/index.js'
import {
  AUTH,
  isEmptyAuthState,
  isSeemsVaildAuthingToken, hasAuthingToken
} from '../const/index.js'
import { switchMap, take, distinctUntilChanged, tap } from '../libs/rx.js'
import { serverConfig$ } from '../domains/config/index.js'
import { makeConfigObserver, configObservables } from '../drivers/config.driver.js'
import { authingAuthObservers, authingAuthObservables } from '../drivers/authing.auth.driver.js'

// 获取本地的 authState 信息并检查
// 如果 authState 信息为空，降级处理 config
// 如果 authState 不为空，检查 token 是否有效
//   如果 token 为 null 或者已经过期，不处理
//   如果 token 有效
//     从服务器拉取配置

const initAuthingAuth = () => {
  return new Promise(resolve => {
    console.log(`[${perf.now}][AuthService] initAuth: subscribe to authingAuthObservables.hybrid()...`)
    authingAuthObservables.hybrid().subscribe(async authState => {
      console.log(`[${perf.now}][AuthService] initAuth: authingAuthObservables.hybrid() received authState...`, authState)
      if (isEmptyAuthState(authState)) {
        console.warn(`[${perf.now}][AuthService] initAuth: authState received isEmpty`)
        // TODO: rewrite server-bind config to local-bind
        resolve('done')
      } else if (!hasAuthingToken(authState)) {
        console.warn(`[${perf.now}][AuthService] initAuth: authState received seems doesnot has token...`)
        resolve('done')
      } else if (!isSeemsVaildAuthingToken(authState)) {
        console.warn(`[${perf.now}][AuthService] initAuth: authState received seems unvalid...`)
        authingAuthObservers.select(AUTH.TYPE.LOGOUT).next()
      } else {
        serverConfig$.subscribe(config => {
          console.log(`[${perf.now}][AuthService] initAuth: pull config from server, result...`, config)
          makeConfigObserver().next(config)
          resolve('done')
        })
      }
    })
  }).then(() => {
    return new Promise(resolve => {
      console.log(`[${perf.now}][AuthService] initAuth: init config mutations relate handler...`)
      configObservables.select('repository.auth.authing.saveTo').pipe(
        distinctUntilChanged(),
        tap(saveTo => {
          console.log(`[${perf.now}][AuthService] initAuth: repository.auth.authing.saveTo changes to...`, saveTo)
        }),
        switchMap(() => authingAuthObservables.hybrid().pipe(take(1)))
      ).subscribe(authState => {
        console.log(`[${perf.now}][AuthService] initAuth: switch authState env. in respond to saveTo changes...`, authState)
        authingAuthObservers.select(AUTH.TYPE.AUTHSTATE).next(authState)
      })
      resolve('done')
    })
  })
}

export { initAuthingAuth, authingAuthObservers, authingAuthObservables }
