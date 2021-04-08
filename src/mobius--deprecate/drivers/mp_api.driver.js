import { jsAPITicketOut$, cardAPITicketOut$ } from '../domains/mp_api/mp_api.repository.js'
import {
  Subject,
  // merge, shareReplay,
  tap
} from '../libs/rx.js'

/******************************************
 *                  Input
 ******************************************/

// none

/******************************************
 *                  Output
 ******************************************/
const jsAPITicketInitOut$ = new Subject()
const cardAPITicketInitOut$ = new Subject()

// const jsAPITicketOutShare$ = merge(jsAPITicketInitOut$).pipe(
//   shareReplay(1)
// )
// const cardAPITicketOutShare$ = merge(cardAPITicketInitOut$).pipe(
//   shareReplay(1)
// )

const observables = {
  trigger: type => {
    let res
    switch (type) {
      case 'js_api_ticket':
        res = jsAPITicketOut$.pipe(
          tap(deviceGeo => {
            jsAPITicketInitOut$.next(deviceGeo)
          })
        )
        break
      case 'card_api_ticket':
        res = cardAPITicketOut$.pipe(
          tap(deviceScreen => {
            cardAPITicketInitOut$.next(deviceScreen)
          })
        )
    }
    if (!res) throw Error('Expected type of mpAPIObservables: js_api_ticket|card_api_ticket ...')
    return res
  }
}

export {
  observables as mpAPIObservables
}
