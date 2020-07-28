import * as MobiusJS from './index.js'

MobiusJS.adaptMultiPlatform({
  webFn: () => {
    window.MobiusJS = MobiusJS
  }
})
