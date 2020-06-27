export * from './debug.js'

const isString = str => Object.prototype.toString.call(str) === '[object String]'
const isObject = obj => obj && typeof obj === 'object'
const isArray = arr => Array.isArray(arr)
const isPromise = obj => obj && Object.prototype.toString.call(obj) === '[object Promise]'
const isFunction = fn => fn && typeof fn === 'function'
const isDate = date => date && Object.prototype.toString.call(date) === '[object Date]'
const isAsyncFn = fn => fn && Object.prototype.toString.call(fn) === '[object AsyncFunction]'
const isEmptyObj = obj => isObject(obj) && Object.keys(obj).length === 0
const isOutDated = date => isDate(new Date(date)) && new Date(date) < new Date()

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
    return source
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
    return source
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

export {
  isString, isObject, isArray, isPromise, isFunction, isDate,
  isEmptyObj, isAsyncFn, isOutDated,
  deepCopy, deepCopyViaJSON,
  emptifyObj,
  get,
  hardDeepMerge, smartDeepMerge
}
