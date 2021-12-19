import {
  perf, getPropByPath, isFunction, isAsyncFunction
} from '../libs/mobius-utils.js'
import { commonConfig as config } from '../config/index.js'
import { map, shareReplay } from '../libs/rx.js'

export * from './repository.common.js'
export * from './driver.common.js'
export * from './scope.common.js'

const _fingerPrint = config.baseFingerPrint.split('')

const _getFingerPrint = () => {
  _fingerPrint.unshift(_fingerPrint.pop())
  return _fingerPrint.join('')
}

const makeUniqueId = seed => {
  return `${seed}--${+new Date()}-${_getFingerPrint()}`
}

const getLinkElement = href => {
  const a = document.createElement('a')
  a.href = href || window.location.href
  return a
}

/***************************************
 *             LocalStorage
 ***************************************/
const _getKey = key => isFunction(key) ? key() : key
const getDataFromLocalStorage = (key) => JSON.parse(window.localStorage.getItem(_getKey(key)))
const setDataToLocalStorage = (key, value) => {
  window.localStorage.setItem(_getKey(key), JSON.stringify(value))
}
const makeLocalStorageHandlers = (key) => {
  const _key = _getKey(key)
  return {
    getData: () => getDataFromLocalStorage(_key),
    setData: value => {
      setDataToLocalStorage(_key, value)
    }
  }
}

/***************************************
 *             Driver
 ***************************************/
const makeObservableSeletor = observable$ => {
  const _observablesMap = new Map()
  return {
    select: path => {
      let res$ = path ? _observablesMap.get(path) : observable$
      if (!res$) {
        res$ = observable$.pipe(
          map(data => getPropByPath(path, data)),
          shareReplay(1)
        )
        _observablesMap.set(path, res$)
      }
      return res$
    }
  }
}
/***************************************
 *             LifeCycle
 ***************************************/
const whenContentLoaded = (todoFn) => {
  console.log(`[${perf.now}][LifeCycleCommon] DOMContentLoaded: handler registered...`)
  document.addEventListener('DOMContentLoaded', () => {
    console.log(`[${perf.now}][LifeCycleCommon] DOMContentLoaded: handler${isAsyncFunction(todoFn) ? '(Async)' : ''} start executing...`)
    todoFn()
    console.log(`[${perf.now}][LifeCycleCommon] DOMContentLoaded: handler executed...`)
  })
}
const whenAllLoaded = (todoFn) => {
  window.onload = () => { todoFn() }
}

export {
  makeUniqueId,
  getLinkElement,
  getDataFromLocalStorage, setDataToLocalStorage, makeLocalStorageHandlers,
  makeObservableSeletor,
  whenContentLoaded, whenAllLoaded
}
