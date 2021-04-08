import { perf, stdLineLog, searchToQueryObj } from '../libs/mobius-utils.js'
import { ofType } from '../common/driver.common.js'
import {
  routerObservers, routerObservables
} from '../drivers/router.driver.js'
import { initHrefListener } from '../domains/router/router.repository.js'

const initRouter = () => {
  initHrefListener()
  const _sig = ['RouterService', 'initRouter']
  console.log(stdLineLog(..._sig, 'start init router service'))
  // NOTE: subscribe to initiate, order of pathname & search matters
  ofType('pathname', routerObservables).subscribe(pathname => {
    console.log(stdLineLog(..._sig, 'initializer of pathname type of routerObservable receives'), pathname)
  })
  ofType('hash', routerObservables).subscribe(hash => {
    console.log(stdLineLog(..._sig, 'initializer of hash type of routerObservable receives'), hash)
  })
  console.log(`[${perf.now}][RouterService] initRouter: check mobius_redirect status...`)
  ofType('search', routerObservables).subscribe(search => {
    console.log(stdLineLog(..._sig, 'initializer of search type of routerObservable receives'), search)
    const mobiusRedirect = searchToQueryObj(search).mobius_redirect
    if (mobiusRedirect) {
      console.log(stdLineLog(..._sig, 'mobius_redirect detected'), mobiusRedirect)
      ofType('href', routerObservers).next({ type: 'replace', href: mobiusRedirect })
    }
  })
}

export {
  routerObservers, routerObservables,
  initRouter
}
