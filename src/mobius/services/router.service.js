import { perf } from '../utils/index.js'
import { ofType } from '../common/driver.common.js'
import {
  routerObservers, routerObservables
} from '../drivers/router.driver.js'

const initRouter = () => {
  console.log(`[${perf.now}][RouterService] initRouter...`)
  // NOTE: 订阅以激活, order of path & search matters
  ofType('path', routerObservables).subscribe(path => {
    console.log(`[${perf.now}][RouterService] routerObservables.type('path)' received...`, path)
  })
  console.log(`[${perf.now}][RouterService] initRouter: check mobius_redirect status...`)
  ofType('search', routerObservables).subscribe(search => {
    console.log(`[${perf.now}][RouterService] routerObservables.type('search)' received...`, search)
    console.log(search)
    const mobiusRedirect = search.substring(1).split('&').reduce((acc, cur) => {
      const [key, value] = cur.split('=')
      if (key === 'mobius_redirect') {
        return decodeURIComponent(value)
      } else {
        return acc || ''
      }
    }, '')
    if (mobiusRedirect) {
      ofType('href', routerObservers).next({ type: 'replace', href: mobiusRedirect })
    }
  })
}

export {
  routerObservers, routerObservables,
  initRouter
}
