import { searchToQueryObj } from '../../libs/mobius-utils.js'
export * from './app-route.driver.js'

const _pushState = (data, title, url) => {
  const currentHref = location.href
  if (currentHref !== url) {
    window.history.pushState(data, title, url)
  }
}
const _replaceState = (data, title, url) => {
  window.history.replaceState(data, title, url)
}

/**
 * @param { { instance, startPath } } options
 */
const initAppRoute = (options = {}) => {
  const { instance, startPath } = options
  const { inputs: { navigate, redirect }, outputs: { history, route } } = instance
  /**
   * 1. 检查 mobius_redirect
   * 2. 检查 pathname
   */
  const { search } = window.location
  const mobiusRedirect = searchToQueryObj(search).mobius_redirect
  if (mobiusRedirect) {
    const { origin, href } = new URL(mobiusRedirect)
    const partialUrl = href.replace(origin, '')
    redirect.mutate(() => ({ type: 'redirect', path: partialUrl }))
  } else {
    const { origin, href } = window.location
    const partialUrl = href.replace(origin, '')
    navigate.mutate(() => ({ type: 'navigate', path: partialUrl }))
  }

  // 当路由发生变化的时候，将路由信息更新到地址栏
  history.subscribeValue(historyRecord => {
    const latestHistory = historyRecord[historyRecord.length - 1]
    const { directive, toRoute } = latestHistory
    if (directive.type === 'redirect') {
      console.log('[appRoute]replaceState', location.origin + toRoute.partialUrl, latestHistory)
      _replaceState({ l: latestHistory }, '', location.origin + toRoute.partialUrl)
    } else {
      console.log('[appRoute]pushState', location.origin + toRoute.partialUrl, latestHistory)
      _pushState({ l: latestHistory }, '', location.origin + toRoute.partialUrl)
    }
  })

  // 当浏览器发生路由事件的时候，将路由事件映射到 route
  window.addEventListener('popstate', event => {
    console.error('[appRoute]', event.state)
    const { href, origin } = window.location
    const partialUrl = href.replace(origin, '')
    navigate.mutate(() => ({ type: 'navigate', path: partialUrl }))
  })

  // 路由驱动初始化完毕之后，酌情切换至指定的地址
  if (startPath) {
    if (route.value && (route.value.pathStr === '/' || route.value.pathStr.indexOf('index.html') >= 0)) {
      redirect.mutate(() => ({ path: startPath }))
    }
  }
}

export { initAppRoute }
