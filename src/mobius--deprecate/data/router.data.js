import { pathnameToString } from '../libs/mobius-utils.js'
import { getLinkElement } from '../common/index.js'

export const getPathname = () => window.location.pathname

export const setPathname = pathname => {
  pathname = pathnameToString(pathname)
  const link = getLinkElement()
  link.pathname = pathname
  history.pushState({}, '', link.href)
  return link.pathname
}
export const replacePathname = pathname => {
  pathname = pathnameToString(pathname)
  const link = getLinkElement()
  link.pathname = pathname
  history.replaceState({}, '', link.href)
  return link.pathname
}

export const getSearch = () => window.location.search
export const setSearch = search => {
  const link = getLinkElement()
  link.search = search
  history.pushState({}, '', link.href)
  return link.search
}
export const replaceSearch = search => {
  const link = getLinkElement()
  link.search = search
  history.replaceState({}, '', link.href)
  return link.search
}

export const getHash = () => window.location.hash
export const setHash = hash => {
  const link = getLinkElement()
  link.hash = hash
  history.pushState({}, '', link.href)
  return link.hash
}
export const replaceHash = hash => {
  const link = getLinkElement()
  link.hash = hash
  history.replaceState({}, '', link.href)
  return link.hash
}

export const getHref = () => window.location.href
export const setHref = href => {
  const link = getLinkElement()
  link.href = href
  history.pushState({}, '', link.href)
  return link.href
}
export const replaceHref = href => {
  const link = getLinkElement()
  link.href = href
  history.replaceState({}, '', link.href)
  return link.href
}

export const onHrefChange = handler => {
  window.addEventListener('popstate', event => {
    handler(getHref())
  })
  window.addEventListener('click', event => {
    const ele = event.target
    const href = ele.getAttribute('href')
    if (ele.tagName.toUpperCase() === 'A' && href !== null) {
      console.warn(111)
      if (
        href.includes('tel:') ||
        href.includes('javascript:') ||
        (getLinkElement(href).host !== location.host)
      ) return false
      // TODO: URL Schemes
      event.preventDefault()
      handler(href)
    }
  }, false)
}

// export {
//   getPathname, setPathname, replacePathname,
//   getSearch, setSearch, replaceSearch,
//   getHash, setHash, replaceHash,
//   getHref, setHref, replaceHref,
//   onHrefChange
// }
