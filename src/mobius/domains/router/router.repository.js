import { getLinkElement } from '../../common/index.js'
import {
  Subject, startWith
} from '../../libs/rx.js'
import {
  getPath, setPath, replacePath,
  getSearch, setSearch, replaceSearch,
  getHash, setHash, replaceHash,
  getHref, setHref, replaceHref,
  onHrefChange
} from '../../data/router.data.js'

// const getInitPath = () => {
//   const redirectFromURI = getRedirectFrom()
//   if (redirectFromURI) {
//     replaceUrl(redirectFromURI)
//   }
//   return getPath()
// }

const pathIn$ = {
  next: ({ type, path }) => {
    // TODO: path verify
    if (type === 'set') {
      _pathOutMid$.next(setPath(path))
    } else if (type === 'replace') {
      _pathOutMid$.next(replacePath(path))
    }
    _hrefOutMid$.next(getHref())
  },
  error: () => {},
  complete: () => {}
}
const _pathOutMid$ = new Subject()
const pathOut$ = _pathOutMid$.pipe(startWith(getPath()))

const searchIn$ = {
  next: ({ type, search }) => {
    // TODO: search verify
    if (type === 'set') {
      _searchOutMid$.next(setSearch(search))
    } else if (type === 'replace') {
      _searchOutMid$.next(replaceSearch(search))
    }
    _hrefOutMid$.next(getHref())
  },
  error: () => {},
  complete: () => {}
}
const _searchOutMid$ = new Subject()
const searchOut$ = _searchOutMid$.pipe(startWith(getSearch()))

const hashIn$ = {
  next: ({ type, hash }) => {
    // TODO: hash verify
    if (type === 'set') {
      _hashOutMid$.next(setHash(hash))
    } else if (type === 'replace') {
      _hashOutMid$.next(replaceHash(hash))
    }
    _hrefOutMid$.next(getHref())
  },
  error: () => {},
  complete: () => {}
}
const _hashOutMid$ = new Subject()
const hashOut$ = _hashOutMid$.pipe(startWith(getHash()))

const hrefIn$ = {
  next: ({ type, href }) => {
    console.warn(`hrefIn$: type -> ${type}, href: ${href}`)
    // TODO: href verify
    if (type === 'set') {
      console.warn('hrefIn$: set href')
      _hrefOutMid$.next(setHref(href))
    } else if (type === 'replace') {
      console.warn('hrefIn$: replace href')
      _hrefOutMid$.next(replaceHref(href))
    }
    console.warn(`hrefIn$: 操作完成之后 path 为： ${getPath()}`)
    _pathOutMid$.next(getPath())
    _searchOutMid$.next(getSearch())
    _hashOutMid$.next(getHash())
  },
  error: () => {},
  complete: () => {}
}
const _hrefOutMid$ = new Subject()
const hrefOut$ = _hrefOutMid$.pipe(startWith(getHref()))

onHrefChange(href => {
  const link = getLinkElement(href)
  _hrefOutMid$.next(link.href)
  _pathOutMid$.next(link.pathname)
  _searchOutMid$.next(link.search)
  _hashOutMid$.next(link.hash)
})

export {
  pathIn$, pathOut$,
  searchIn$, searchOut$,
  hashIn$, hashOut$,
  hrefIn$, hrefOut$
}
