import {
  isNil, isString, isPlainObject, isArray, isFunction
} from '../libs/mobius-utils'

export interface JavaScriptCollection {
  internal: Array<{ element: HTMLScriptElement }>
  external: Array<{ element: HTMLScriptElement, src: string }>
  [key: string]: any
}

/**
 * 采集页面中已经存在的 JavaScript 脚本，包括内部脚本和外部脚本两种
 *
 * - 内部脚本：（InternalScript）指 JavaScript 代码直接写在 `<script></script>` 标签内部
 *
 * - 外部脚本：（ExternalScript）指通过设置 `<script></script>` 标签的 `src` 属性进行引入的 JavaScript 脚本文件
 *
 * @refer https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/script#attr-type
 */
export const collectJavaScript = (): JavaScriptCollection => {
  const scripts = Array.from(document.scripts)
  const collection = scripts.reduce<JavaScriptCollection>((acc, item) => {
    if (item.src !== null) {
      acc.external.push({ src: item.src, element: item })
    } else {
      acc.internal.push({ element: item })
    }
    return acc
  }, { internal: [], external: [] })
  return collection
}

export interface SingleJavaScriptLoadOptions {
  src: string
  name?: string
  group?: string
  collect?: (element: HTMLScriptElement) => unknown
  isolate?: () => void
  deisolate?: () => void
  beforeLoad?: (contexts: { src: string, name?: string }) => void
  onLoad?: (contexts: { src: string, name?: string, element: HTMLScriptElement, options: SingleJavaScriptLoadOptions }) => void
  afterLoad?: (contexts: { src: string, name?: string, element: HTMLScriptElement }) => void
  onError?: (
    contexts: { src: string, name?: string, options: SingleJavaScriptLoadOptions, error: string | Event, reject: (reason?: any) => void }
  ) => void
}
export interface SingleJavaScriptLoadResult extends SingleJavaScriptLoadOptions {
  element: HTMLScriptElement
  pack?: unknown
}

const JAVASCRIPT_LOAD_STACK: Array<[Promise<void>, Promise<SingleJavaScriptLoadResult>]> = []
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
 */
export const loadSingleJavascript = async (options: SingleJavaScriptLoadOptions): Promise<SingleJavaScriptLoadResult> => {
  const {
    src, name, collect, beforeLoad, onLoad, afterLoad, onError
  } = options

  if (isNil(src)) {
    throw (new TypeError('"src" is required.'))
  }
  if (!isString(src)) {
    throw (new TypeError('"src" is expected to be type of "String".'))
  }
  if (!isNil(onLoad) && !isFunction(onLoad)) {
    throw (new TypeError('"onLoad" is expected to be type of "Function".'))
  }
  if (!isNil(onError) && !isFunction(onError)) {
    throw (new TypeError('"onError" is expected to be type of "Function".'))
  }

  let _resolveResult: (value: SingleJavaScriptLoadResult | PromiseLike<SingleJavaScriptLoadResult>) => void
  let _rejectResult: (reason?: any) => void
  const resultPromise = new Promise<SingleJavaScriptLoadResult>((resolve, reject) => {
    _resolveResult = resolve
    _rejectResult = reject
  })
  let _resolveLoad: (value: void | PromiseLike<void>) => void
  let _rejectLoad: (reason?: any) => void
  const loadPromise = new Promise<void>((resolve, reject) => {
    _resolveLoad = resolve
    _rejectLoad = reject
  })

  const load = async (): Promise<void> => {
    return await new Promise((resolve) => {
      const existElement: HTMLScriptElement | null = document.querySelector(`script[src="${src}"]`)

      interface LoadResult {
        src: string
        name?: string
        pack?: any
      }
      const loadResult: LoadResult = { src, name }

      if (existElement !== null) {
        if (isFunction(collect)) {
          loadResult.pack = collect(existElement)
        }

        _resolveResult({ ...options, ...loadResult, element: existElement })
      } else {
        const head = document.head ?? document.getElementsByTagName('head')[0]
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.onerror = (error) => {
          if (isFunction(onError)) {
            try {
              onError({ name, src, options, error, reject: _rejectResult })
            } catch (error) {
              _rejectResult(error)
            }
          }
          _rejectResult(error)
        }
        script.onload = () => {
          if (isFunction(onLoad)) {
            try {
              onLoad({ name, src, element: script, options })
            } catch (error) {
              _rejectResult(error)
            }
          }
          if (isFunction(afterLoad)) {
            try {
              afterLoad({ name, src, element: script })
            } catch (error) {
            }
          }

          if (isFunction(collect)) {
            loadResult.pack = collect(script)
          }

          _resolveResult({ ...options, ...loadResult, element: script })
        }

        if (isFunction(beforeLoad)) {
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
    JAVASCRIPT_LOAD_STACK.push([loadPromise, resultPromise])
    void resultPromise.then(() => {
      _resolveLoad()
    })
    void load()
  } else {
    const [previousLoad, previousResult] = JAVASCRIPT_LOAD_STACK[JAVASCRIPT_LOAD_STACK.length - 1]
    const currentLoadStack = [...JAVASCRIPT_LOAD_STACK]
    JAVASCRIPT_LOAD_STACK.push([loadPromise, resultPromise])

    void previousLoad.then(() => {
      const isolateStep = new Promise<void>((resolve) => {
        const isolateStates = Array.from<boolean>({ length: currentLoadStack.length })
        currentLoadStack.forEach(([_, result], index) => {
          void result.then(value => {
            if (isFunction(value.isolate)) {
              value.isolate()
            }
            isolateStates[index] = true
            if (isolateStates.every(i => i)) {
              resolve()
            }
          })
        })
      })
      const loadStep = isolateStep.then(async () => {
        void load()
        return await resultPromise
      })
      const deisolateStep = loadStep.then(async () => {
        return await new Promise<void>((resolve) => {
          const deisolateStates = Array.from<boolean>({ length: currentLoadStack.length })
          currentLoadStack.forEach(([_, result], index) => {
            void result.then(value => {
              if (isFunction(value.deisolate)) {
                value.deisolate()
              }
              deisolateStates[index] = true
              if (deisolateStates.every(i => i)) {
                resolve()
              }
            })
          })
        })
      })
      void deisolateStep.then(() => {
        _resolveLoad()
      })
    })
  }

  return await resultPromise
}

export interface MultipleJavaScriptLoadOptions {
  options: Array<string | SingleJavaScriptLoadOptions>
  onLoad?: SingleJavaScriptLoadOptions['onLoad']
  onError?: SingleJavaScriptLoadOptions['onError']
}
export interface MultipleJavaScriptLoadResult {
  success: SingleJavaScriptLoadResult[]
  fail: Array<{ src: string, reason: any }>
}

export const loadMultipleJavaScript = async (
  options: MultipleJavaScriptLoadOptions
): Promise<MultipleJavaScriptLoadResult> => {
  const { options: loadOptions, onLoad, onError } = options

  if (isNil(loadOptions)) {
    throw (new TypeError('"options" is required.'))
  }
  if (!isArray(loadOptions)) {
    throw (new TypeError('"options" is expected to be type of "Array".'))
  }
  if (!isNil(onLoad) && !isFunction(onLoad)) {
    throw (new TypeError(`"onLoad" is expected to be type of Function, but received "${typeof onLoad}".`))
  }
  if (!isNil(onError) && !isFunction(onError)) {
    throw (new TypeError(`"onError" is expected to be type of Function, but received "${typeof onError}".`))
  }
  if ((loadOptions.length > 0) && !isFunction(Promise.allSettled)) {
    throw (new TypeError('Promise.allSettled is not supported, pls upgrade your browser.'))
  }

  const preparedOptions = loadOptions.map<SingleJavaScriptLoadOptions>(item => {
    if (isString(item)) {
      return { src: item }
    } else if (isPlainObject(item)) {
      return item
    } else {
      throw (new TypeError('item of src is expected to be type of "PlainObject" | "String".'))
    }
  })

  return await Promise.allSettled(preparedOptions.map(async item => await loadSingleJavascript(item)))
    .then(res => res.reduce<MultipleJavaScriptLoadResult>((acc, item, index) => {
      if (item.status === 'fulfilled') {
        acc.success.push(item.value)
      }
      if (item.status === 'rejected') {
        acc.fail.push({ src: preparedOptions[index].src, reason: item.reason })
      }
      return acc
    }, { success: [], fail: [] }))
}
