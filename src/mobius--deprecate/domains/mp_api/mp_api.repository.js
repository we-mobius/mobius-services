import { Observable } from '../../libs/rx.js'
import { getJsAPITicketThrottled, getCardAPITicketThrottled } from '../../data/mp_api.data.js'

const jsAPITicketOut$ = new Observable(observer => {
  getJsAPITicketThrottled().then(jsApiTicket => {
    observer.next(jsApiTicket || {})
    observer.complete()
  })
})

const cardAPITicketOut$ = new Observable(observer => {
  getCardAPITicketThrottled().then(cardApiTicket => {
    observer.next(cardApiTicket || {})
    observer.complete()
  })
})

export {
  jsAPITicketOut$,
  cardAPITicketOut$
}
