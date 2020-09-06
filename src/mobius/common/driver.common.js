import {
  isMap, isObject,
  hasOwnProperty, propEq,
  curry, applyTo
} from '../utils/index.js'
import { filter } from '../libs/rx.js'

export const dredge = applyTo

export const ofType = curry((type, observables) => {
  // 如果是 observable 的话直接返回 observable
  if (hasOwnProperty('subscribe', observables)) {
    return observables
  }
  // 否则按键取值
  if (isMap(observables)) {
    return observables.get(type)
  }
  if (isObject(observables)) {
    return observables[type]
  }
})

export const withResponseFilter = curry((type, observable) =>
  observable.pipe(filter(propEq('status', type)))
)
