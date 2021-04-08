import {
  initWepayPayment, wepayPaymentObservers, wepayPaymentObservables,
  startJSAPIWepay
} from './wepay.payment.service.js'

const paymentObservers = wepayPaymentObservers
const paymentObservables = wepayPaymentObservables

const initPayment = async (...args) => {
  await initWepayPayment(...args)
}
const startPay = async (...args) => {
  startJSAPIWepay(...args)
}

export {
  initWepayPayment, wepayPaymentObservers, wepayPaymentObservables,
  startJSAPIWepay,
  initPayment, paymentObservers, paymentObservables,
  startPay
}
