import {
  merge, shareReplay
} from '../libs/rx.js'
import {
  wepayParamsIn$, wepayParamsOut$,
  wepayIn$, wepayOut$,
  tradeStateIn$, tradeStateOut$
} from '../domains/payment/wepay.payment.repository.js'

/******************************************
 *                  Input
 ******************************************/
const _observersMap = new Map([
  ['wepay_params', wepayParamsIn$],
  ['wepay', wepayIn$],
  ['trade_state', tradeStateIn$]
])
const observers = {
  select: type => {
    return _observersMap.get(type)
  }
}
/******************************************
 *                  Output
 ******************************************/

const wepayParamsOutShare$ = merge(wepayParamsOut$).pipe(
  shareReplay(1)
)
const wepayOutShare$ = merge(wepayOut$).pipe(
  shareReplay(1)
)
const tradeStateOutShare$ = merge(tradeStateOut$).pipe(
  shareReplay(1)
)

const observables = {
  type: type => {
    const members = {
      wepay_params: wepayParamsOutShare$,
      wepay: wepayOutShare$,
      trade_state: tradeStateOutShare$
    }
    return members[type]
  }
}

export {
  observers as wepayPaymentObservers,
  observables as wepayPaymentObservables
}
