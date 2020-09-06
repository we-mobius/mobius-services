import { isArray } from '../utils/index.js'
import { getLinkElement } from '../common/index.js'

const getRedirectFrom = () => window.location.search.substring(1).split('&').reduce((acc, cur) => {
  const [key, value] = cur.split('=')
  if (key === 'mobius_redirect') {
    return value ? decodeURIComponent(value) : ''
  } else {
    // 只取第一个有效值
    return acc || ''
  }
}, '')

const getPath = () => window.location.pathname

const setPath = path => {
  if (isArray(path)) {
    path = path.join('/')
  }
  const link = getLinkElement()
  link.pathname = path
  history.pushState({}, '', link.href)
  return link.pathname
}
const replacePath = path => {
  if (isArray(path)) {
    path = path.join('/')
  }
  const link = getLinkElement()
  link.pathname = path
  history.replaceState({}, '', link.href)
  return link.pathname
}

const getSearch = () => window.location.search
const setSearch = search => {
  const link = getLinkElement()
  link.search = search
  history.pushState({}, '', link.href)
  return link.search
}
const replaceSearch = search => {
  const link = getLinkElement()
  link.search = search
  history.replaceState({}, '', link.href)
  return link.search
}

const getHash = () => window.location.hash
const setHash = hash => {
  const link = getLinkElement()
  link.hash = hash
  history.pushState({}, '', link.href)
  return link.hash
}
const replaceHash = hash => {
  const link = getLinkElement()
  link.hash = hash
  history.replaceState({}, '', link.href)
  return link.hash
}

const getHref = () => window.location.href
const setHref = href => {
  const link = getLinkElement()
  link.href = href
  history.pushState({}, '', link.href)
  return link.href
}
const replaceHref = href => {
  const link = getLinkElement()
  link.href = href
  history.replaceState({}, '', link.href)
  return link.href
}

const onHrefChange = handler => {
  window.addEventListener('popstate', evt => {
    handler(getHref())
  })
  window.addEventListener('click', evt => {
    const ele = evt.target
    const href = ele.getAttribute('href')
    if (ele.tagName.toUpperCase() === 'A' && href) {
      if (
        href.includes('tel:') ||
        (getLinkElement(href).host !== location.host)
      ) return false
      evt.preventDefault()
      handler(href)
    }
  }, false)
}

export {
  getRedirectFrom,
  getPath, setPath, replacePath,
  getSearch, setSearch, replaceSearch,
  getHash, setHash, replaceHash,
  getHref, setHref, replaceHref,
  onHrefChange
}
