import { perf } from '../utils/index.js'
import { filter } from '../libs/rx.js'
import {
  wepayPaymentObservers, wepayPaymentObservables
} from '../drivers/wepay.payment.driver.js'
import {
  mpAuthObservables
} from '../drivers/mp.auth.driver.js'

const initWepayPayment = async () => {
  // 初始化支付流程
  //   - 拿到 wepay params 之后调起支付
  //   - 支付成功之后向后台查询交易状态
  console.log(`[${perf.now}][WepayPaymentService] initWepayPayment...`)
  wepayPaymentObservables.type('wepay_params').subscribe(wepayParams => {
    wepayPaymentObservers.select('wepay').next(wepayParams)
  })
  wepayPaymentObservables.type('wepay').pipe(
    filter(payStatus => payStatus.status === 'success')
  ).subscribe(payStatus => {
    wepayPaymentObservers.select('trade_state').next({
      openid: payStatus.data.openid,
      outTradeNo: payStatus.data.outTradeNo,
      forceQuery: false
    })
  })
}
const startJSAPIWepay = async ({ goods, deviceInfo, attach }) => {
  // - openid 为发起支付的首要前提
  // - 拿到 openid 之后与商品信息一起获取 wepay params
  console.log(`[${perf.now}][WepayPaymentService] startJSAPIWepay...`, { goods, deviceInfo, attach })
  mpAuthObservables.type('auth_state').select('openid').subscribe(openid => {
    wepayPaymentObservers.select('wepay_params').next({ type: 'JSAPI', openid, goods, deviceInfo, attach })
  })
}

export {
  initWepayPayment, wepayPaymentObservers, wepayPaymentObservables,
  startJSAPIWepay
}
