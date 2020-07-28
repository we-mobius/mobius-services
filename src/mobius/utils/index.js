export * from './debug.js'
export * from './string.js'

const isDefined = variable => typeof variable !== 'undefined'

const isString = str => Object.prototype.toString.call(str) === '[object String]'
const isObject = obj => obj && typeof obj === 'object'
const isArray = arr => Array.isArray(arr)
const isPromise = obj => obj && Object.prototype.toString.call(obj) === '[object Promise]'
const isFunction = fn => fn && typeof fn === 'function'
const isDate = date => date && Object.prototype.toString.call(new Date(date)) === '[object Date]' && !!new Date(date).getTime()
const isAsyncFn = fn => fn && Object.prototype.toString.call(fn) === '[object AsyncFunction]'
const isEmptyObj = obj => isObject(obj) && Object.keys(obj).length === 0
const isOutDated = date => isDate(date) && new Date(date).getTime() < new Date().getTime()

const asIs = sth => sth

// @refer to: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_get
const get = (obj, path, defaultValue = undefined) => {
  const travel = regexp =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj)
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/)
  return result === undefined || result === obj ? defaultValue : result
}

const emptifyObj = obj => {
  for (const key in obj) {
    if (isObject(obj[key])) {
      emptifyObj(obj[key])
    } else {
      delete obj[key]
    }
  }
  return obj
}

const deepCopyViaJSON = (obj) => JSON.parse(JSON.stringify(obj))
// @refer to: https://github.com/davidmarkclements/rfdc/blob/master/index.js
const deepCopy = (obj) => {
  if (!isObject(obj)) {
    return obj
  }
  const newObj = isArray(obj) ? [] : {}
  for (const key in obj) {
    if (isObject(obj[key])) {
      newObj[key] = deepCopy(obj[key])
    } else {
      newObj[key] = obj[key]
    }
  }
  return newObj
}

const hardDeepMerge = (target, source) => {
  if (!isObject(target) || !isObject(source)) {
    return target
  }

  Object.keys(source).forEach(key => {
    const targetValue = target[key]
    const sourceValue = source[key]

    if (isArray(targetValue) && isArray(sourceValue)) {
      target[key] = deepCopy(sourceValue)
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = hardDeepMerge(targetValue, sourceValue)
    } else {
      target[key] = sourceValue
    }
  })

  return target
}

const smartDeepMerge = (target, source) => {
  if (!isObject(target) || !isObject(source)) {
    return target
  }

  Object.keys(source).forEach(key => {
    const targetValue = target[key]
    const sourceValue = source[key]

    if (isArray(targetValue) && isArray(sourceValue)) {
      target[key] = targetValue.concat(sourceValue)
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = smartDeepMerge(targetValue, sourceValue)
    } else {
      target[key] = sourceValue
    }
  })

  return target
}

const debounce = (fn, ms) => {
  let timer
  let waiting = []
  return () => {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      const res = await fn()
      waiting.forEach(fn => {
        fn(res)
      })
      waiting = []
    }, ms)
    return new Promise(resolve => {
      waiting.push(resolve)
    })
  }
}

const throttle = (fn) => {
  let isCalling = false
  let waiting = []
  return () => {
    if (!isCalling) {
      isCalling = true
      Promise.resolve(fn()).then(res => {
        waiting.forEach(waitFn => {
          waitFn(res)
        })
        waiting = []
        isCalling = false
      })
    }
    return new Promise(resolve => {
      waiting.push(resolve)
    })
  }
}

const throttleTime = (fn, ms) => {
  let isCalling = false
  let waiting = []
  return () => {
    if (!isCalling) {
      isCalling = true
      Promise.resolve(fn()).then(res => {
        waiting.forEach(waitFn => {
          waitFn(res)
        })
        waiting = []
      })
      setTimeout(() => {
        isCalling = false
      }, ms)
    }
    return new Promise(resolve => {
      waiting.push(resolve)
    })
  }
}

const packing = (fn, range) => {
  let timer
  let waiting = []
  let data = {}
  return (oData) => {
    clearTimeout(timer)
    data = hardDeepMerge(data, oData)
    timer = setTimeout(async () => {
      const res = await fn(data)
      waiting.forEach(waitFn => {
        waitFn(res)
      })
      waiting = []
    }, range)
    return new Promise(resolve => {
      waiting.push(resolve)
    })
  }
}

export {
  isDefined,
  isString, isObject, isArray, isPromise, isFunction, isDate,
  isEmptyObj, isAsyncFn, isOutDated,
  deepCopy, deepCopyViaJSON,
  emptifyObj,
  asIs, get,
  hardDeepMerge, smartDeepMerge,
  debounce, throttle, throttleTime, packing
}
