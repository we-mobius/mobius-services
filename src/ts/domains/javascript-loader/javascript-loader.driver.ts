import {
  isNil, isString, isPlainObject, isArray,
  dataToResponse, makeFailResponse, isSuccessResponse,
  isVacuo, isTerminator,
  Data, Mutation, TERMINATOR,
  replayWithLatest,
  pipeAtom,
  createGeneralDriver, useGeneralDriver_,
  filterT_, pluckT_
} from '../../libs/mobius-utils'
import {
  collectJavaScript, loadMultipleJavaScript
} from '../../data/loader.data'

import type {
  SuccessResponse, FailResponse,
  Terminator, ReplayDataMediator,
  DriverOptions, DriverLevelContexts, DriverSingletonLevelContexts, DriverInstance
} from '../../libs/mobius-utils'
import type {
  JavaScriptCollection, SingleJavaScriptLoadOptions,
  SingleJavaScriptLoadResult, MultipleJavaScriptLoadResult
} from '../../data/loader.data'

type ScriptSrc = string
/**
 *   ```
 *     -> { src: 'https://example.com/target.js' }
 *     -> { src: 'https://example.com/target.js', group: 'example' }
 *     -> [{ src: 'https://example.com/target_0.js', group: 'example' }, 'https://example.com/target_1.js']
 *     -> { src: ['https://example.com/target_0.js', { src: 'https://example.com/target_1.js', group: 'example_0' }], group: 'example_1' }
 *   ```
 */
export type JavaScriptLoadOptions
  = SingleJavaScriptLoadOptions
  | SingleJavaScriptLoadOptions[]
  | Array<SingleJavaScriptLoadOptions | ScriptSrc>
  | ({ src: Array<SingleJavaScriptLoadOptions | ScriptSrc> } & Omit<SingleJavaScriptLoadOptions, 'src'>)

/**
 * Neaten the `JavaScriptLoadOptions` to `SingleJavaScriptLoadOptions[]`.
 */
export const neatenJavaScriptLoadOptions = (options: JavaScriptLoadOptions): SingleJavaScriptLoadOptions[] => {
  const res: SingleJavaScriptLoadOptions[] = []

  if (!isPlainObject(options) && !isArray(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject" | "Array".'))
  }

  if (isArray(options)) {
    options.forEach(item => {
      if (!isPlainObject(item) && !isString(item)) {
        throw (new TypeError('"item" is expected to be type of "String" | "PlainObject".'))
      }
      if (isPlainObject(item)) {
        res.push(item)
      } else if (isString(item)) {
        res.push({ src: item })
      }
    })
  } else if (isPlainObject(options)) {
    const { src, ...restOptions } = options
    if (isNil(src)) {
      throw (new TypeError('"src" is required when "options" is of type "PlainObject".'))
    }
    if (!isString(src) && !isArray(src)) {
      throw (new TypeError('"src" is expected to be type of "String" | "Array".'))
    }
    if (isString(src)) {
      res.push({ ...restOptions, src })
    } else if (isArray(src)) {
      src.forEach(item => {
        if (!isPlainObject(item) && !isString(item)) {
          throw (new TypeError('"item" is expected to be type of "String" | "Array".'))
        }
        if (isPlainObject(item)) {
          res.push({ ...restOptions, ...item })
        } else if (isString(item)) {
          res.push({ ...restOptions, src: item })
        }
      })
    }
  }

  return res
}

/**
 * Check if the `JavaScriptLoadOptions` is valid.
 *
 * 1. preserved groupname detect, etc. internal, external, newcome
 * 2. ...
 */
const checkOptions = (options: SingleJavaScriptLoadOptions[]): boolean => {
  // 1
  const preservedGroupnameList = ['internal', 'external', 'newcome']
  return options.every(item => isNil(item.group) || (!isNil(item.group) && !preservedGroupnameList.includes(item.group)))
}

/**
 * Merge source collection to target collection.
 */
const mergeScriptCollections = (source: Partial<JavaScriptCollection>, target: JavaScriptCollection): JavaScriptCollection => {
  if (isPlainObject(source) && isPlainObject(target)) {
    Object.entries(source).forEach(([k, v]) => {
      target[k] = target[k] ?? []
      v.forEach((i: { element: HTMLScriptElement }) => {
        if (target[k].some((s: { element: HTMLScriptElement }) => s.element === i.element) === false) {
          target[k].push(i)
        }
      })
    })
    return target
  } else {
    throw (new TypeError('"ScriptCollections" is expected to be type of "PlainObject".'))
  }
}

/************************************************************************************************
 *
 *                                           Main Types
 *
 ************************************************************************************************/

interface SuccessLoadResult {
  success: MultipleJavaScriptLoadResult['success']
  collection: {
    [key: string]: SingleJavaScriptLoadResult[]
    newcome: SingleJavaScriptLoadResult[]
  }
}
interface FailLoadResult {
  fail: MultipleJavaScriptLoadResult['fail']
}
type SuccessLoadResponse = SuccessResponse<SuccessLoadResult>
type FailLoadResponse = FailResponse<FailLoadResult>
type LoadResponseUnion = SuccessLoadResponse | FailLoadResponse

interface ScriptLoadDriverSingletonLevelContexts extends DriverSingletonLevelContexts {
  inputs: {
    javascriptLoadOptions: Data<JavaScriptLoadOptions>
  }
  outputs: {
    javascriptCollection: ReplayDataMediator<JavaScriptCollection>
    javascriptLoadResponse: Data<LoadResponseUnion>
  }
}
export interface ScriptLoadDriverInstance extends DriverInstance {
  inputs: {
    javascriptLoadOptions: Data<JavaScriptLoadOptions>
  }
  outputs: {
    javascriptCollection: ReplayDataMediator<JavaScriptCollection>
    javascriptLoadResponse: Data<LoadResponseUnion>
  }
}

/************************************************************************************************
 *
 *                                           Main Driver
 *
 ************************************************************************************************/

/**
 *
 */
export const makeScriptLoaderDriver =
createGeneralDriver<DriverOptions, DriverLevelContexts, ScriptLoadDriverSingletonLevelContexts, ScriptLoadDriverInstance>({
  prepareSingletonLevelContexts: (options, driverLevelContexts) => {
    const javascriptLoadOptionsInD = Data.empty<JavaScriptLoadOptions>()

    interface PrivateData<V = any> {
      type: symbol
      value: V
    }
    const privateDataType = Symbol('privateData')
    const isPrivateData = <V = any>(v: any): v is PrivateData<V> => v.type === privateDataType

    const loadJavascriptM = Mutation.ofLiftBoth<JavaScriptLoadOptions | PrivateData<LoadResponseUnion>, LoadResponseUnion | Terminator>(
      (prev, _, mutation) => {
        if (isVacuo(prev)) return TERMINATOR

        if (isPrivateData(prev)) {
          return prev.value
        }

        // 将加载脚本的选项进行格式化
        const neatedOptions = neatenJavaScriptLoadOptions(prev)
        // 检查选项是否合理有效
        if (!checkOptions(neatedOptions)) {
          throw (new TypeError('Preserved groupname received!'))
        }

        // 调用加载函数，执行加载逻辑，加载指定脚本
        void loadMultipleJavaScript({ options: neatedOptions }).then(res => {
          const { success, fail } = res
          if (isArray(success) && success.length > 0) {
            const collection: SuccessLoadResult['collection'] = { newcome: [] }
            success.forEach(item => {
              collection.newcome.push(item)
              const originalOptions = neatedOptions.find(i => i.src === item.src)!
              const group = originalOptions.group ?? 'default_group'
              collection[group] = collection[group] ?? []
              collection[group].push(item)
            })
            mutation!.mutate({
              type: privateDataType,
              value: dataToResponse({ success, collection })
            })
          }
          if (isArray(fail) && fail.length > 0) {
            mutation!.mutate({
              type: privateDataType,
              value: makeFailResponse({ statusMessage: 'Some of outer JavaScript fail to load', data: { fail } })
            })
          }
        })
        return TERMINATOR
      }
    )
    const javascriptLoadResponseD = Data.empty<LoadResponseUnion>()
    pipeAtom(javascriptLoadOptionsInD, loadJavascriptM, javascriptLoadResponseD)

    const successJavascriptD: Data<SuccessLoadResult> = javascriptLoadResponseD.pipe(filterT_(isSuccessResponse), pluckT_('data'))

    const successToScriptsM = Mutation.ofLiftBoth<SuccessLoadResult, JavaScriptCollection | Terminator>(
      (prev, scripts) => {
        if (isVacuo(prev)) return TERMINATOR
        if (isTerminator(scripts)) return TERMINATOR

        const { collection: { newcome, ...otherScripts } } = prev

        newcome.forEach(n => {
          if (!isNil(n.src) && !scripts.external.some(i => i.element === n.element)) {
            scripts.external.push(n)
          }
          if (isNil(n.src) && !scripts.internal.some(i => i.element === n.element)) {
            scripts.internal.push(n)
          }
        })

        scripts.newcome = [...newcome]
        const mergedScripts = mergeScriptCollections(otherScripts, scripts)

        return mergedScripts
      }
    )

    // { internal: [], external: [] }
    const javascriptCollectionRD = replayWithLatest(1, Data.of(collectJavaScript()))
    pipeAtom(successJavascriptD, successToScriptsM, javascriptCollectionRD)

    return {
      inputs: {
        javascriptLoadOptions: javascriptLoadOptionsInD
      },
      outputs: {
        javascriptCollection: javascriptCollectionRD,
        javascriptLoadResponse: javascriptLoadResponseD
      }
    }
  },
  prepareInstance: (options, driverLevelContexts, singletonLevelContexts) => {
    const { inputs, outputs, ...others } = singletonLevelContexts
    const driverInstance = {
      inputs: { ...singletonLevelContexts.inputs },
      outputs: { ...singletonLevelContexts.outputs },
      ...others
    }
    return driverInstance
  }
})

/**
 * @see {@link makeScriptLoaderDriver}
 */
export const useScriptLoaderDriver = useGeneralDriver_(makeScriptLoaderDriver)
