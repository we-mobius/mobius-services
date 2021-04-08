import { stdLineLog, isArray, isString } from '../libs/mobius-utils.js'
// dynamic loader
//  -> JavaScript
//  -> CSS
//  -> json
//  -> font, img
//  -> others...

// collect exist sources to a 'native' group
// put newcome sources to a 'nonnative' group

// @see https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/script#attr-type
export const collectJavaScript = () => {
  const scripts = Array.from(document.scripts)
  const collection = scripts.reduce((acc, item) => {
    if (item.src) {
      acc.outer.push(item)
    } else {
      acc.inner.push(item)
    }
    return acc
  }, { inner: [], outer: [] })
  return collection
}

export const collectCSS = () => {
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"'))
  const styles = Array.from(document.styles)
  const collection = {
    inner: styles,
    outer: links
  }
  return collection
}

export const collectSources = () => {

}

// @see https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLScriptElement
// @return { src: '', script: HTMLScriptElement }
export const loadJavaScript = ({ src, onLoad, onError }) => {
  if (!src) return Promise.resolve({})
  return new Promise((resolve, reject) => {
    const existElement = document.querySelector(`script[src="${src}"]`)
    if (existElement) {
      resolve({ src, script: existElement })
    } else {
      const sig = ['LoaderData', 'loadJavaScript']
      const head = document.head || document.getElementsByTagName('head')[0]
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.onerror = (error) => {
        onError && onError(src)
        reject(new URIError(
          stdLineLog(...sig, `The script ${error.target.src} is not accessible.`)
        ))
      }
      script.onload = () => {
        console.log(stdLineLog(...sig, `Script "${src}" successfully loaded`))
        onLoad && onLoad(script)
        resolve({ src, script })
      }
      script.src = src
      head.appendChild(script)
    }
  })
}

// @return { success: [{ src: '', script: HTMLScriptElement }], fail: [{ src: '', reason: '' }]}
export const loadMultipleJavaScript = ({ src, onLoad, onError }) => {
  if (!src) return Promise.resolve({ success: [], fail: [] })
  if (!Promise.allSettled) {
    console.warn('Promise.allSettled is not supported, pls update your browser.')
    return Promise.resolve({ success: [], fail: [] })
  }
  if (isArray(src)) {
    // FIXME: allSettled compatibility
    return Promise.allSettled(src.map(item => {
      return loadJavaScript({ src: item.src, onLoad, onError })
    })).then(res => res.reduce((acc, item, index) => {
      if (item.status === 'fulfilled') {
        acc.success.push(item.value)
      }
      if (item.status === 'rejected') {
        acc.fail.push({ src: src[index].src, reason: item.reason })
      }
      return acc
    }, { success: [], fail: [] }))
  } else if (isString(src)) {
    return loadJavaScript({ src, onLoad, onError }).then(res => {
      return { success: [res], fail: [] }
    })
  } else {
    return Promise.resolve({ success: [], fail: [] })
  }
}

export const loadCSS = () => {

}

export const loadFont = () => {

}

export const loadImage = () => {

}

export const loadSource = () => {

}
