import {
  isMap, isObject, isFunction,
  propEq,
  curry, applyTo
} from '../libs/mobius-utils.js'
import { isObservable, filter } from '../libs/rx.js'

export const dredge = applyTo

export const ofType = curry((type, observables) => {
  // 如果是 observable 的话直接返回 observable
  if (isObservable(observables)) return observables
  // 否则按键取值
  if (isMap(observables)) return observables.get(type)
  if (isObject(observables)) return observables[type]
  if (isFunction(observables.type)) return observables.type(type)
  throw Error(`Can not extract type '${type}' of target observables.`)
})

export const withResponseFilter = curry((type, observable) =>
  observable.pipe(filter(propEq('status', type)))
)
