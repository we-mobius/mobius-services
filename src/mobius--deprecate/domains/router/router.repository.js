import { stdLineLog, pathnameToString } from '../../libs/mobius-utils.js'
import { getLinkElement } from '../../common/index.js'
import {
  Subject, startWith
} from '../../libs/rx.js'
import {
  getPathname, setPathname, replacePathname,
  getSearch, setSearch, replaceSearch,
  getHash, setHash, replaceHash,
  getHref, setHref, replaceHref,
  onHrefChange
} from '../../data/router.data.js'

const pathnameIn$ = {
  next: ({ type = 'set', pathname }) => {
    // TODO: path verify
    pathname = pathnameToString(pathname)
    console.log(stdLineLog('RouterRepository', 'pathnameIn$.next', 'execute'), { type, pathname })
    if (type === 'set') {
      _pathnameOutMid$.next(setPathname(pathname))
    } else if (type === 'replace') {
      _pathnameOutMid$.next(replacePathname(pathname))
    }
    _hrefOutMid$.next(getHref())
  },
  error: () => {},
  complete: () => {}
}
const _pathnameOutMid$ = new Subject()
const pathnameOut$ = _pathnameOutMid$.pipe(startWith(getPathname()))

const searchIn$ = {
  next: ({ type = 'set', search }) => {
    // TODO: search verify
    console.log(stdLineLog('RouterRepository', 'searchIn$.next', 'execute'), { type, search })
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
  next: ({ type = 'set', hash }) => {
    // TODO: hash verify
    console.log(stdLineLog('RouterRepository', 'hashIn$.next', 'execute'), { type, hash })
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
  next: ({ type = 'set', href }) => {
    // TODO: href verify
    console.log(stdLineLog('RouterRepository', 'hrefIn$.next', 'execute'), { type, href })
    if (type === 'set') {
      _hrefOutMid$.next(setHref(href))
    } else if (type === 'replace') {
      _hrefOutMid$.next(replaceHref(href))
    }
    console.log(stdLineLog('RouterRepository', 'hrefIn$.next', `href after executed -> ${getHref()}`))
    _pathnameOutMid$.next(getPathname())
    _searchOutMid$.next(getSearch())
    _hashOutMid$.next(getHash())
  },
  error: () => {},
  complete: () => {}
}
const _hrefOutMid$ = new Subject()
const hrefOut$ = _hrefOutMid$.pipe(startWith(getHref()))

export const initHrefListener = () => {
  onHrefChange(href => {
    const link = getLinkElement(href)
    _hrefOutMid$.next(link.href)
    _pathnameOutMid$.next(link.pathname)
    _searchOutMid$.next(link.search)
    _hashOutMid$.next(link.hash)
  })
}

export {
  pathnameIn$, pathnameOut$,
  searchIn$, searchOut$,
  hashIn$, hashOut$,
  hrefIn$, hrefOut$
}
