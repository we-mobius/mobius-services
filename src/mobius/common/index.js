import { perf, isFunction, isAsyncFn } from '../utils/index.js'
import { commonConfig as config } from '../config/index.js'

const _fingerPrint = config.baseFingerPrint.split('')

const _getFingerPrint = () => {
  _fingerPrint.unshift(_fingerPrint.pop())
  return _fingerPrint.join('')
}

const makeUniqueId = (init) => {
  return `${init}-${new Date().getTime()}-${_getFingerPrint()}`
}

const _getKey = key => isFunction(key) ? key() : key
const getDataFromLocalStorage = (key) => JSON.parse(window.localStorage.getItem(_getKey(key)))
const setDataToLocalStorage = (key, value) => {
  window.localStorage.setItem(_getKey(key), JSON.stringify(value))
}
const makeLocalStorageHandlers = (key) => {
  return {
    getData: () => getDataFromLocalStorage(_getKey(key)),
    setData: (value) => {
      setDataToLocalStorage(_getKey(key), value)
    }
  }
}

const whenContentLoaded = (todoFn) => {
  console.log(`[${perf.now}][LifeCycleCommon] DOMContentLoaded: handler registered...`)
  document.addEventListener('DOMContentLoaded', () => {
    console.log(`[${perf.now}][LifeCycleCommon] DOMContentLoaded: handler${isAsyncFn(todoFn) ? '(Async)' : ''} start executing...`)
    todoFn()
    console.log(`[${perf.now}][LifeCycleCommon] DOMContentLoaded: handler executed...`)
  })
}

const whenAllLoaded = (todoFn) => {
  window.onload = () => { todoFn() }
}

export {
  makeUniqueId,
  getDataFromLocalStorage, setDataToLocalStorage, makeLocalStorageHandlers,
  whenContentLoaded,
  whenAllLoaded
}
