import {
  Subject
} from '../../libs/rx.js'
import {
  getWepayParams,
  getTradeState,
  wepay
} from '../../data/wepay.payment.data.js'

const wepayParamsIn$ = {
  next: options => {
    getWepayParams(options).then(wepayParams => {
      wepayParamsOut$.next(wepayParams || {})
    })
  },
  error: () => {},
  complete: () => {}
}
const wepayParamsOut$ = new Subject()

const wepayIn$ = {
  next: options => {
    wepay(options).then(payStatus => {
      wepayOut$.next(payStatus)
    })
  }
}
const wepayOut$ = new Subject()

const tradeStateIn$ = {
  next: options => {
    getTradeState(options).then(tradeState => {
      tradeStateOut$.next(tradeState || {})
    })
  },
  error: () => {},
  complete: () => {}
}
const tradeStateOut$ = new Subject()

export {
  wepayParamsIn$, wepayParamsOut$,
  wepayIn$, wepayOut$,
  tradeStateIn$, tradeStateOut$
}
