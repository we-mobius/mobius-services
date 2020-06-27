import { isObject } from '../utils/index.js'
import { Biu } from '../libs/axios.js'
import { authObservables } from '../drivers/auth.driver.js'

let _token = ''
const innerBiutor = Biu.scope('inner')
innerBiutor.addConfigInjector(config => {
  const data = config.data
  if (!data || !isObject(data)) {
    return config
  }
  data.token = _token
  return config
})

const initRequest = ({
  withToken = true
}) => {
  if (withToken) {
    authObservables.hybrid().subscribe(authState => {
      _token = authState.token
    })
  }
}

export { Biu, initRequest }
