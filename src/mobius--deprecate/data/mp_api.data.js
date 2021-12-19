import { perf, getPropByPath, throttle } from '../libs/mobius-utils.js'
import { Biu } from '../libs/biu.js'
import { dataConfig } from '../config/index.js'
import { MPAPI_REQUEST_TYPES } from '../const/mp_api.const.js'

const biu = Biu.scope('inner').biu

const getAPITicketUrl = () => getPropByPath('mp_api.requestInfo.getAPITicketUrl', dataConfig)

const getJsAPITicket = async () => {
  console.log(`[${perf.now}][MpAPIDate] getJsAPITicket: send a request...`)
  let res
  const type = MPAPI_REQUEST_TYPES.getJsAPITicket
  const url = getAPITicketUrl()
  if (url === '') {
    res = null
  } else {
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
          type: type
        }
      }
    })
      .then(response => {
        return response.data.status === 'success' ? response.data.data[type] : null
      })
      .catch(e => {
        console.error(e)
        return null
      })
  }
  return res
}
const getJsAPITicketThrottled = throttle(getJsAPITicket)
const getCardAPITicket = async () => {
  console.log(`[${perf.now}][MpAPIDate] getCardAPITicket: send a request...`)
  let res
  const type = MPAPI_REQUEST_TYPES.getCardAPITicket
  const url = getAPITicketUrl()
  if (url === '') {
    res = null
  } else {
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
          type: type
        }
      }
    })
      .then(response => {
        return response.data.status === 'success' ? response.data.data[type] : null
      })
      .catch(e => {
        console.error(e)
        return null
      })
  }
  return res
}
const getCardAPITicketThrottled = throttle(getCardAPITicket)

export {
  getJsAPITicketThrottled,
  getCardAPITicketThrottled
}
