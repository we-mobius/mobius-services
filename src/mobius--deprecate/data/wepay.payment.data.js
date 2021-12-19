import { perf, getPropByPath, adaptMultipleEnvironments } from '../libs/mobius-utils.js'
import { dataConfig } from '../config/index.js'
import { Biu } from '../libs/biu.js'
import { wxweb } from '../libs/wx.js'

const biu = Biu.scope('inner').biu

// keep config fresh
const getWepayParamsUrl = () => getPropByPath('payment.wepay.requestInfo.getWepayParamsUrl', dataConfig)
const getTradeStateUrl = () => getPropByPath('payment.wepay.requestInfo.getTradeStateUrl', dataConfig)

const getWepayParams = async ({ type, openid, goods, deviceInfo, attach }) => {
  let res
  const url = getWepayParamsUrl()
  if (!url) {
    res = null
  } else {
    console.log(`[${perf.now}][WepayPaymentData] getWepayParams: send a getWepayParams request...`, { type, openid })
    res = await biu({
      url: url,
      method: 'POST',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        action: 'get',
        payload: {
          type,
          openid,
          goods,
          deviceInfo,
          attach
        }
      }
    })
      .then(response => {
        console.log(`[${perf.now}][WepayPaymentData] getWepayParams: getWepayParams request receives...`, response.data)
        return response.data.status === 'success' ? response.data.data[type] : null
      })
      .catch(e => {
        console.error(e)
        return null
      })
  }
  return res
}
const getTradeState = async ({ openid, outTradeNo, forceQuery }) => {
  let res
  const url = getTradeStateUrl()
  const type = 'check_trade_state'
  if (!url) {
    res = null
  } else {
    console.log(`[${perf.now}][WepayPaymentData] getTradeState: send a getTradeState request...`, { type, openid, outTradeNo, forceQuery })
    res = await biu({
      url: url,
      method: 'POST',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        action: 'get',
        payload: {
          type,
          openid,
          outTradeNo,
          forceQuery
        }
      }
    })
      .then(response => {
        console.log(`[${perf.now}][WepayPaymentData] getTradeState: getTradeState request receives...`, response.data)
        return response.data.status === 'success' ? response.data.data[type] : null
      })
      .catch(e => {
        console.error(e)
        return null
      })
  }
  return res
}

const wepay = async (wepayParams) => {
  console.log(`[${perf.now}][WepayPaymentData] wepay: wepayParams -> `, wepayParams)
  return new Promise((resolve, reject) => {
    try {
      adaptMultipleEnvironments({
        webFn: () => {
          wxweb.chooseWXPay({
            timestamp: wepayParams.timestamp,
            nonceStr: wepayParams.nonceStr,
            package: wepayParams.package,
            signType: wepayParams.signType,
            paySign: wepayParams.paySign,
            success: res => {
              // 支付成功后的回调函数
              // res.errMsg === 'chooseWXPay:ok'
              console.log(`[${perf.now}][WepayPaymentData] wepay: pay success...`, res)
              resolve({
                status: 'success',
                status_message: res.errMsg,
                data: { outTradeNo: wepayParams.outTradeNo, openid: wepayParams.openid }
              })
            },
            fail: res => {
              console.log(`[${perf.now}][WepayPaymentData] wepay: pay fail...`, res)
              resolve({
                status: 'fail',
                status_message: res.errMsg,
                data: { outTradeNo: wepayParams.outTradeNo, openid: wepayParams.openid }
              })
            },
            cancel: res => {
              console.log(`[${perf.now}][WepayPaymentData] wepay: pay cancel...`, res)
              resolve({
                status: 'cancel',
                status_message: res.errMsg,
                data: { outTradeNo: wepayParams.outTradeNo, openid: wepayParams.openid }
              })
            },
            complete: res => {
              console.log(`[${perf.now}][WepayPaymentData] wepay: pay complete...`, res)
              resolve({
                status: 'complete',
                status_message: res.errMsg,
                data: { outTradeNo: wepayParams.outTradeNo, openid: wepayParams.openid }
              })
            }
          })
        },
        wxminaFn: () => {
          console.warn(`[${perf.now}][WepayPaymentData] wepay: wxminaFn is under construct`)
        }
      })
    } catch (error) {
      console.log(`[${perf.now}][WepayPaymentData] wepay: pay error...`, error)
      console.error(error)
      resolve({
        status: 'error',
        status_message: error,
        data: { outTradeNo: wepayParams.outTradeNo, openid: wepayParams.openid }
      })
    }
  })
}

export {
  getWepayParams,
  getTradeState,
  wepay
}
