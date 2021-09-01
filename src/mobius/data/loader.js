import {
  isString, isObject, isArray, isFunction
} from '../libs/mobius-utils.js'

/**
 * 采集页面中已经存在的 JavaScript 脚本，包括内部脚本和外部脚本两种
 *
 * - 内部脚本：（InternalScript）指 JavaScript 代码直接写在 `<script></script>` 标签内部
 *
 * - 外部脚本：（ExternalScript）指通过设置 `<script></script>` 标签的 `src` 属性进行引入的 JavaScript 脚本文件
 *
 * @refer https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/script#attr-type
 */
export const collectJavaScript = () => {
  const scripts = Array.from(document.scripts)
  const collection = scripts.reduce((acc, item) => {
    if (item.src) {
      acc.external.push({ src: item.src, element: item })
    } else {
      acc.internal.push({ element: item })
    }
    return acc
  }, { internal: [], external: [] })
  return collection
}

const JAVASCRIPT_LOAD_STACK = []
/**
 * 将指定的 script 脚本加载到页面中
 *
 * 加载之前进行检测：
 * - 如果指定地址（src）的脚本已经存在于页面中，直接返回该脚本作为加载结果
 * - 如果指定地址（src）的脚本不存在于页面中，则通过插入 `script` 标签的方式将脚本加载到页面中，然后返回加载结果
 *
 * 以 `script` 标签加载到页面中的脚本全部拥有 JavaScript 环境的完全访问权限，当脚本加载涉及到全局变量的变更时，
 * 并行加载会出现难以预料的错误，所以这里统一采用串行加载。
 * - 加载器会维护一个加载队列，只有先申请的脚本加载完成之后才会加载后申请的脚本
 * - 脚本加载的选项中可以定义辅助隔离全局变量的函数（isolate、deisolate），
 *   在加载某个脚本之前，加载器会遍历执行其它已加载的脚本的 isolate 函数，加载完成之后，再遍历执行已加载脚本的 deisolate 函数。
 *
 * @refer https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLScriptElement
 * @param { { src: string, collect?: function, onLoad?: function, onError?: function } } option
 * @return { { src: string, script: HTMLScriptElement } }
 */
export const loadSingleJavascript = (options = {}) => {
  const {
    src, name, collect, isolate = () => {}, deisolate = () => {}, beforeLoad, onLoad, afterLoad, onError
  } = options

  if (!src) {
    throw (new TypeError('"src" is required.'))
  }
  if (!isString(src)) {
    throw (new TypeError(`"src" is expected to be type of String, but received "${typeof src}".`))
  }
  if (onLoad && !isFunction(onLoad)) {
    throw (new TypeError(`"onLoad" is expected to be type of Function, but received "${typeof onLoad}".`))
  }
  if (onError && !isFunction(onError)) {
    throw (new TypeError(`"onError" is expected to be type of Function, but received "${typeof onError}".`))
  }

  let _resolveResult, _rejectResult
  const resultPromise = new Promise((resolve, reject) => {
    _resolveResult = resolve
    _rejectResult = reject
  })
  let _resolveLoad, _rejectLoad
  const loadPromise = new Promise((resolve, reject) => {
    _resolveLoad = resolve
    _rejectLoad = reject
  })
  const load = () => {
    return new Promise((resolve) => {
      const existElement = document.querySelector(`script[src="${src}"]`)

      const res = { src, name }

      if (existElement) {
        if (collect) {
          res.collect = collect
          res.pack = collect(existElement)
        }

        _resolveResult({ ...options, element: existElement })
      } else {
        const head = document.head || document.getElementsByTagName('head')[0]
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.onerror = (error) => {
          if (onError) {
            try {
              onError({ name, src, options, error, reject: _rejectResult })
            } catch (error) {
              _rejectResult(error)
            }
          }
          _rejectResult(error)
        }
        script.onload = () => {
          if (onLoad) {
            try {
              onLoad({ name, src, element: script, options })
            } catch (error) {
              _rejectResult(error)
            }
          }
          if (afterLoad) {
            try {
              afterLoad({ name, src, element: script })
            } catch (error) {
            }
          }

          if (collect) {
            res.collect = collect
            res.pack = collect(script)
          }

          _resolveResult({ ...options, ...res, element: script })
        }

        if (beforeLoad) {
          try {
            beforeLoad({ name, src })
          } catch (error) {
          }
        }
        script.src = src
        head.appendChild(script)
      }
    })
  }

  if (JAVASCRIPT_LOAD_STACK.length === 0) {
    load()
    JAVASCRIPT_LOAD_STACK.push([loadPromise, resultPromise])
    resultPromise.then(() => {
      _resolveLoad()
    })
  } else {
    const [previousLoad, previousResult] = JAVASCRIPT_LOAD_STACK[JAVASCRIPT_LOAD_STACK.length - 1]
    const tempLoadStack = [...JAVASCRIPT_LOAD_STACK]
    previousLoad.then(() => {
      const isolateStep = new Promise((resolve) => {
        const isolateStack = Array.from({ length: tempLoadStack.length })
        tempLoadStack.forEach(([_, result], index) => {
          result.then(value => {
            if (value.isolate && isFunction(value.isolate)) {
              value.isolate()
            }
            isolateStack[index] = true
            if (isolateStack.every(i => i)) {
              resolve()
            }
          })
        })
      })
      const loadStep = isolateStep.then(() => {
        load()
        return resultPromise
      })
      const deisolateStep = loadStep.then(() => {
        return new Promise((resolve) => {
          const deisolateStack = Array.from({ length: tempLoadStack.length })
          tempLoadStack.forEach(([_, result], index) => {
            result.then(value => {
              if (value.deisolate && isFunction(value.deisolate)) {
                value.deisolate()
              }
              deisolateStack[index] = true
              if (deisolateStack.every(i => i)) {
                resolve()
              }
            })
          })
        })
      })
      deisolateStep.then(() => {
        _resolveLoad()
      })
    })
    JAVASCRIPT_LOAD_STACK.push([loadPromise, resultPromise])
  }

  return resultPromise
}

export const loadMultipleJavaScript = ({ options, onLoad, onError }) => {
  if (!options) {
    throw (new TypeError('"options" is required.'))
  }
  if (!isArray(options)) {
    throw (new TypeError(`"options" is expected to be type of Array, but received "${typeof options}".`))
  }
  if (onLoad && !isFunction(onLoad)) {
    throw (new TypeError(`"onLoad" is expected to be type of Function, but received "${typeof onLoad}".`))
  }
  if (onError && !isFunction(onError)) {
    throw (new TypeError(`"onError" is expected to be type of Function, but received "${typeof onError}".`))
  }
  if ((options.length > 0) && !Promise.allSettled) {
    throw (new TypeError('Promise.allSettled is not supported, pls upgrade your browser.'))
  }

  options = options.map(item => {
    if (isString(item)) {
      return { src: item }
    } else if (isObject(item)) {
      return item
    } else {
      throw (new TypeError(`item of src is expected to be type of Object | String, but received "${typeof item}".`))
    }
  })

  return Promise.allSettled(options.map(item => loadSingleJavascript(item)))
    .then(res => res.reduce((acc, item, index) => {
      if (item.status === 'fulfilled') {
        acc.success.push(item.value)
      }
      if (item.status === 'rejected') {
        acc.fail.push({ src: options[index].src, reason: item.reason })
      }
      return acc
    }, { success: [], fail: [] }))
}
