import {
  isString, isObject, isArray,
  makeSuccessResponseF, makeFailResponseF,
  Data, Mutation, TERMINATOR,
  replayWithLatest,
  pipeAtom,
  createGeneralDriver, useGeneralDriver,
  filterT, pluckT
} from '../../libs/mobius-utils.js'
import {
  collectJavaScript, loadMultipleJavaScript
} from '../../data/loader.js'

/**
 * @param { object | array } options
 *   ```
 *     -> { src: 'https://example.com/target.js' }
 *     -> { src: 'https://example.com/target.js', group: 'example' }
 *     -> [{ src: 'https://example.com/target_0.js', group: 'example' }, 'https://example.com/target_1.js']
 *     -> { src: ['https://example.com/target_0.js', { src: 'https://example.com/target_1.js', group: 'example_0' }], group: 'example_1' }
 *   ```
 * @return { [{ src: string, group?: string }, ...] }
 *   ```
 *     -> [{ src: 'https://example.com/target_1.js', group?: 'example_0' }]
 *   ```
 *
 */
const neatenOptions = options => {
  const res = []

  if (!isObject(options) && !isArray(options)) {
    throw (new TypeError(`"options" is expected to be type of Object | Array, but received "${typeof options}".`))
  }

  if (isObject(options)) {
    const { src, group, beforeLoad, onLoad, afterLoad, onError } = options
    if (!src) {
      throw (new TypeError('"src" is required when "options" is of type Object.'))
    }
    if (!isString(src) && !isArray(src)) {
      throw (new TypeError(`"src" is expected to be type of String | Array, but received "${typeof src}".`))
    }
    if (isString(src)) {
      res.push({ src, group, beforeLoad, onLoad, afterLoad, onError })
    } else if (isArray(src)) {
      src.forEach(item => {
        if (!isObject(item) && !isString(item)) {
          throw (new TypeError(`"item" is expected to be type of String | Array, but received "${typeof item}".`))
        }
        if (isObject(item)) {
          item.group = item.group || group
          item.beforeLoad = item.beforeLoad || beforeLoad
          item.onLoad = item.onLoad || onLoad
          item.afterLoad = item.afterLoad || afterLoad
          item.onError = item.onError || onError
          res.push(item)
        } else if (isString(item)) {
          res.push({ src: item, group, beforeLoad, onLoad, afterLoad, onError })
        }
      })
    }
  } else if (isArray(options)) {
    options.forEach(item => {
      if (!isObject(item) && !isString(item)) {
        throw (new TypeError(`"item" is expected to be type of String | Object, but received "${typeof item}".`))
      }
      if (isObject(item)) {
        res.push(item)
      } else if (isString(item)) {
        res.push({ src: item })
      }
    })
  }

  return res
}
// 1. preserved groupname detect, etc. internal, external, newcome
// 2. ...
const checkOptions = options => {
  // 1
  const preservedGroupnameList = ['internal', 'external', 'newcome']
  return options.every(item => !preservedGroupnameList.includes(item.group))
}

const mergeScriptCollections = (a, b) => {
  if (isObject(a) && isObject(b)) {
    Object.entries(a).forEach(([k, v]) => {
      b[k] = b[k] || []
      v.forEach(i => {
        if (!b[k].some(s => s.element === i.element)) {
          b[k].push(i)
        }
      })
    })
    return b
  }
}

export const scriptLoaderDriver = createGeneralDriver({
  prepareSingletonLevelContexts: (options, driverLevelContexts) => {
    const javascriptInD = Data.empty()
    const loadJavascriptM = Mutation.ofLiftBoth((options, _, mutation) => {
      options = neatenOptions(options)
      if (!checkOptions(options)) {
        throw (new TypeError('Preserved groupname received!'))
      }
      loadMultipleJavaScript({ options }).then(res => {
        const { success, fail } = res
        if (isArray(success) && success.length > 0) {
          const collection = { newcome: [] }
          success.forEach(item => {
            collection.newcome.push(item)
            const option = options.find(i => i.src === item.src)
            const group = option.group || 'default_group'
            collection[group] = collection[group] || []
            collection[group].push(item)
          })
          mutation.triggerOperation(() => makeSuccessResponseF({ success, collection }))
        }
        if (isArray(fail) && fail.length > 0) {
          mutation.triggerOperation(() => makeFailResponseF('Some of outer JavaScript fail to load', { fail }))
        }
      })
      return TERMINATOR
    })
    const javascriptLoadResultD = Data.empty()
    pipeAtom(javascriptInD, loadJavascriptM, javascriptLoadResultD)

    const successJavascriptD = javascriptLoadResultD.pipe(filterT(res => res.status === 'success'), pluckT('data'))

    const successToScriptsM = Mutation.ofLiftBoth(({ collection: newScripts }, scripts) => {
      const { newcome = [], ...otherScripts } = newScripts

      newcome.forEach(n => {
        if (n.src && !scripts.external.some(i => i.element === n.element)) {
          scripts.external.push(n)
        }
        if (!n.src && !scripts.internal.some(i => i.element === n.element)) {
          scripts.internal.push(n)
        }
      })

      scripts.newcome = [...newcome]
      const mergedScripts = mergeScriptCollections(otherScripts, scripts)

      return mergedScripts
    })
    // { internal: [], external: [] }
    const javascriptsRD = replayWithLatest(1, Data.of(collectJavaScript()))
    pipeAtom(successJavascriptD, successToScriptsM, javascriptsRD)

    return {
      inputs: {
        javascript: javascriptInD
      },
      outputs: {
        javascripts: javascriptsRD,
        javascriptLoadResult: javascriptLoadResultD
      }
    }
  },
  prepareInstance: (options, driverLevelContexts, singletonLevelContexts) => {
    const { inputs, outputs, ...others } = singletonLevelContexts
    return { inputs: { ...singletonLevelContexts.inputs }, outputs: { ...singletonLevelContexts.outputs }, ...others }
  }
})

export const useScriptLoaderDriver = useGeneralDriver(scriptLoaderDriver)
