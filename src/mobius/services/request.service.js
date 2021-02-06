import { perf, modifyBiuConfig } from '../libs/mobius-utils.js'
import { Biu } from '../libs/biu.js'
import { authingAuthObservables as authObservables } from '../drivers/authing.auth.driver.js'

export * from '../libs/biu.js'

let _token = ''

export const withToken = modifyBiuConfig({
  data: { token: _token }
})

const innerBiutor = Biu.scope('inner')
innerBiutor.addConfigModifier(withToken)

export const initRequest = ({
  withToken = true
} = { withToken: true }) => {
  if (withToken) {
    authObservables.hybrid().subscribe(authState => {
      _token = authState.token
      console.log(`[${perf.now}][RequestService] initRequest: auth token received...`, _token)
    })
  }
}
