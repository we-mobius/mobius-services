import {
  isString, isObject, isArray, isFunction
} from '../libs/mobius-utils.js'

// @refer: https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/script#attr-type
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
 * @refer https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLScriptElement
 * @param { { src: string, collect?: function, onLoad?: function, onError?: function } } option
 * @return { { src: string, script: HTMLScriptElement } }
 */
export const loadSingleJavascript = ({ src, name, collect, beforeLoad, onLoad, afterLoad, onError }) => {
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

  let _resolve, _reject
  const resultPromise = new Promise((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })
  const loadPromise = () => {
    return new Promise(() => {
      const existElement = document.querySelector(`script[src="${src}"]`)

      const res = { src, name }

      if (existElement) {
        if (collect) {
          res.collect = collect
          res.pack = collect(existElement)
        }
        _resolve({ ...res, element: existElement })
      } else {
        const head = document.head || document.getElementsByTagName('head')[0]
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.onerror = (error) => {
          if (onError) {
            try {
              onError({ name, src, error, reject: _reject })
            } catch (error) {
              _reject(error)
            }
          }
          _reject(error)
        }
        script.onload = () => {
          if (onLoad) {
            try {
              onLoad({ name, src, script })
            } catch (error) {
              _reject(error)
            }
          }
          if (afterLoad) {
            try {
              afterLoad({ name, src, script })
            } catch (error) {
            }
          }

          if (collect) {
            res.collect = collect
            res.pack = collect(existElement)
          }

          _resolve({ ...res, element: script })
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
    JAVASCRIPT_LOAD_STACK.push([loadPromise(), resultPromise])
  } else {
    const [previousLoad, previousResult] = JAVASCRIPT_LOAD_STACK[JAVASCRIPT_LOAD_STACK.length - 1]
    previousResult.then(() => loadPromise())
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
