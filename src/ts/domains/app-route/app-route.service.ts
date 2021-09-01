import { searchToQueryObj } from '../../libs/mobius-utils'
export * from './app-route.driver'

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
  // 如果路由类型是 redirect，更新模式为 replaceState
  // 如果路由类型是 roaming（popstate），不进行操作
  // 如果是其它情况，更新模式一律为 pushState
  history.subscribeValue(historyRecords => {
    const latestHistory = historyRecords[historyRecords.length - 1]
    const { directive, toRoute } = latestHistory

    // TODO: timestamp 需要做 unique 处理
    // TODO: roaming 类型的路由，不操作 history state
    if (directive.type === 'redirect') {
      console.log('[appRoute]replaceState', location.origin + toRoute.partialUrl, latestHistory)
      _replaceState({ history: latestHistory, timestamp: Date.now() }, '', location.origin + toRoute.partialUrl)
    } else {
      console.log('[appRoute]pushState', location.origin + toRoute.partialUrl, latestHistory)
      _pushState({ history: latestHistory, timestamp: Date.now() }, '', location.origin + toRoute.partialUrl)
    }
  })

  // TODO: roaming 类型的路由，再触发之后调用 history API 将 URL 同步给浏览器

  // 当浏览器发生路由事件的时候，将路由事件映射到 route
  // TODO: hash 变更触发的 popstate 事件，通过 navigate 通道变更路由
  // TODO: 浏览器前进后退按钮和 go(step) API 触发的 popstate 事件，通过 roaming 通道变更路由
  // TODO: 通过向 state 中实现注入 timestamp 来判断 popstate 事件是否由前进后退按钮触发
  // TODO: 浏览器 go(step) API 触发的 popstate 事件，需要单独维护一个 history 列表对 step 进行判断
  // TODO: 浏览器能够在不同的 origin 之间进行 history 跳转，所以单独维护的 history 列表需要通过 LocalStorage 做持久化处理
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
