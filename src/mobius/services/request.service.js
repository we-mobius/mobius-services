import { perf, isObject } from '../utils/index.js'
import { axios, Biu, makeCustomBiutor } from '../libs/biu.js'
import { authingAuthObservables as authObservables } from '../drivers/authing.auth.driver.js'

let _token = ''
const innerBiutor = Biu.scope('inner')
innerBiutor.addConfigInjector(config => {
  const data = config.data
  if (!data || !isObject(data)) {
    return config
  }
  if (_token) {
    data.token = _token
  }
  return config
})

const initRequest = ({
  withToken = true
} = { withToken: true }) => {
  if (withToken) {
    authObservables.hybrid().subscribe(authState => {
      _token = authState.token
      console.log(`[${perf.now}][RequestService] initRequest: auth token received...`, _token)
    })
  }
}

export {
  axios,
  Biu, makeCustomBiutor,
  initRequest
}
