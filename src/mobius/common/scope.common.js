import {
  isString, isObject, isArray, isBoolean, isFunction,
  Data, isAtom,
  replayWithLatest,
  binaryTweenPipeAtom
} from '../libs/mobius-utils.js'

/**
 * Map{
 *   [Creator | CreatorInfo]: ScopeManager{
 *     [scope]: Instance,
 *     ...
 *   },
 *   ...
 * }
 */

const SCOPE_MANAGERS = new Map()

/**
 * @param creator Object | Function, required
 */
const createScopeManager = (creator) => {
  if (!creator) throw new TypeError('"creator" is required!')
  const scopeMap = new Map()
  const promiseMap = new Map()

  return {
    getCreator: () => creator,
    /**
     * register an instance with given scope,
     * if there is none, create one,
     * if there is one, return it.
     *
     * @param scope String | Object
     * @param options Object({ instance, params? }) | Any, can be omitted when the type of scope is Object
     * @param params Any
     *
     * @accept ({ scope, instance?, params? })
     * @accept (scope, { instance?, params? })
     */
    registerScope: (scope, options) => {
      let _scope, _instance, _params
      // accept ({ scope, instance?, params? })
      if (isObject(scope)) {
        _instance = scope.instance
        _params = scope.params
        _scope = scope.scope
      } else if (isString(scope)) {
        // accept (scope, { instance?, params? })
        _scope = scope
        if (isObject(options)) {
          _instance = options.instance
          _params = options.params
        } else {
          _params = options
        }
      } else {
        throw new TypeError(`first argument of registerScope is expected to be type of "String" | "Object", but received ${typeof scope}.`)
      }
      if (!isString(_scope)) throw new TypeError(`"scope" is required and is expected to be type of "String", but received ${typeof _scope}.`)
      if (!creator && !_instance) throw new TypeError('"creator" is not given, "instance" is required when "registerScope"!')
      if (isObject(_params)) {
        _params = { ..._params, '@scopeName': _scope }
      }

      let instance = scopeMap.get(_scope)

      // If there is no instance registered, create one.
      // Then check if there is a promise has been made, if so, trigger it
      if (!instance) {
        instance = _instance || (isFunction(creator) ? (_params ? (isArray(_params) ? creator(..._params) : creator(_params)) : creator({ '@scopeName': _scope })) : creator)
        scopeMap.set(_scope, instance)

        const promise = promiseMap.get(_scope)
        if (promise) {
          if (isAtom(instance)) {
            binaryTweenPipeAtom(replayWithLatest(1, instance), promise)
          } else {
            binaryTweenPipeAtom(replayWithLatest(1, Data.of(instance)), promise)
          }
        }
      }

      return instance
    },
    /**
     * @param scope String | Object
     * @param options Boolean | Object({ acceptPromise? })
     *
     * @accept accept ({ scope, options | ...options })
     * @accept accept (scope, options? )
     */
    getInstance: (scope, options = {}) => {
      // accept ({ scope, options | ...options })
      const _scope = isObject(scope) ? scope.scope : scope
      if (!isString(_scope)) throw new TypeError(`"_scope" is required and is expected to be type of "String", but received ${typeof _scope}.`)

      if (isObject(scope)) {
        if (!scope.options) {
          options = Object.assign({}, scope)
          delete options.scope
        } else {
          options = scope.options
        }
      } else if (isString(scope)) {
        // accept (scope, options? )
        if (isBoolean(options)) {
          options = { acceptPromise: options }
        }
      }

      const { acceptPromise = true } = options

      const instance = scopeMap.get(_scope)
      if (instance) return instance
      if (!acceptPromise) return false
      const promise = promiseMap.get(_scope)
      if (promise) return promise
      const _promise = Data.empty()
      promiseMap.set(_scope, _promise)
      return _promise
    },
    // ! use function declaration to keep "this" context
    /**
     * registerScope -> getInstance
     */
    scope: function (scope) {
      this.registerScope(scope)
      return this.getInstance(scope)
    },
    /**
     * @param scope String
     * @return Boolean
     */
    isRegisteredScope: (scope) => !!scopeMap.get(scope)
  }
}

/**
 * @param creator Any
 * @param options Object | Boolean, optional
 * @param options.isStray Boolean, optional
 */
export const makeScopeManager = (creator, options = {}) => {
  if (isBoolean(options)) {
    options = { isStray: options }
  }

  const { isStray = false } = options
  let manager

  if (isStray) {
    manager = createScopeManager(creator)
    SCOPE_MANAGERS.set({ creator, options: { isStray } }, manager)
  } else {
    manager = SCOPE_MANAGERS.get(creator)
    if (!manager) {
      manager = createScopeManager(creator)
      SCOPE_MANAGERS.set(creator, manager)
    }
  }

  return manager
}
