import { Subject, startWith } from '../../libs/rx.js'
import { isArray, isObject, isString, makeSuccessResponseF, makeFailResponseF } from '../../libs/mobius-utils.js'
import {
  collectJavaScript, loadJavaScript, loadMultipleJavaScript,
  collectCSS, loadCSS
} from '../../data/loader.data.js'

// collection :: object
//   -> newcome: all of newcome script
//   -> inner: all of inner script
//   -> outer: all of outer script
//   -> [groupname]: manage newcome script by group

// @return { src: [{ src: 'https://example.com/target_1.js', group: 'example_0' }]}
const neatenOptions = options => {
  const res = { src: [] }
  if (isObject(options)) {
    const { src, group } = options
    if (!src) {
      throw new Error('"src" in options is expected to be not empty')
    }
    if (!isString(src) && !isArray(src)) {
      throw new Error(`Unsupported src: type of "src" in options is expected to be String | Array, but receives, ${typeof src}`)
    }
    if (isString(src)) {
      res.src.push({ src, group })
    }
    if (isArray(src)) {
      src.forEach(item => {
        if (!isObject(item) && !isString(item)) {
          throw new Error(`Unsupported src item: type of item in src array is expected to be Object | String, but receives, ${typeof item}`)
        }
        if (isObject(item)) {
          item.group = item.group || group
          res.src.push(item)
        }
        if (isString(item)) {
          res.src.push({ src: item, group })
        }
      })
    }
  } else if (isArray(options)) {
    options.forEach(item => {
      if (!isObject(item) && !isString(item)) {
        throw new Error(`Unsupported src item: type of item in src array is expected to be Object | String, but receives, ${typeof item}`)
      }
      if (isObject(item)) {
        item.group = item.group || undefined
        res.src.push(item)
      }
      if (isString(item)) {
        res.src.push({ src: item, undefined })
      }
    })
  } else {
    throw new Error(`Unsupported Options: type of options is expected to be Object | Array, but receives, ${typeof options}`)
  }
  return res
}

// 1. preserved groupname detect, etc. inner, outer, dynamic, newcome
// 2. ...
const checkOptions = options => {
  // 1
  const preservedGroupnameList = ['inner', 'outer', 'dynamic', 'newcome']
  const { src } = options
  return src.every(item => !preservedGroupnameList.includes(item.group))
}

const jsIn$ = {
  // options can be:
  //   -> { src: 'https://example.com/target.js' }
  //   -> { src: 'https://example.com/target.js', group: 'example' }
  //   -> [{ src: 'https://example.com/target_0.js', group: 'example' }, 'https://example.com/target_1.js']
  //   -> { src: ['https://example.com/target_0.js', { src: 'https://example.com/target_1.js', group: 'example_0' }], group: 'example_1' }
  next: options => {
    options = neatenOptions(options)
    const isVaildOptions = checkOptions(options)
    if (!isVaildOptions) {
      throw new Error('Preserved groupname received!')
    }
    loadMultipleJavaScript(options).then(res => {
      const { success, fail } = res
      // if (isObject(success)) {
      //   const group = options.group || 'default_group'
      //   const collection = { newcome: [success.script], [group]: [success.script], dynamic: [success.script], ...collectJavaScript() }
      //   _jsOutMid$.next(collection)
      // }
      if (isArray(success) && success.length > 0) {
        const collection = { newcome: [], dynamic: [], ...collectJavaScript() }
        success.forEach(({ src, script }) => {
          collection.newcome.push(script)
          collection.dynamic.push(script)
          const optionItem = (isObject(options) ? options.src : options).find(item => isObject(item) && item.src === src)
          const group = optionItem.group || options.group || 'default_group'
          collection[group] = collection[group] || []
          collection[group].push(script)
        })
        _jsOutMid$.next(makeSuccessResponseF({ success, collection }))
      }
      if (isArray(fail) && fail.length > 0) {
        _jsOutMid$.next(makeFailResponseF('Some of outer JavaScript fail to load', { fail }))
      }
    })
  },
  error: () => {},
  complete: () => {}
}
const _jsOutMid$ = new Subject()
const jsOut$ = _jsOutMid$.pipe(startWith(makeSuccessResponseF({ collection: { ...collectJavaScript() } })))

export {
  jsIn$, jsOut$
}
