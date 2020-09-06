import * as MobiusJS from './index.js'

MobiusJS.adaptMultiPlatform({
  webFn: () => {
    window.MobiusJS = MobiusJS
  },
  wxminaFn: () => {
    // eslint-disable-next-line no-undef
    wx.MobiusJS = MobiusJS
  },
  defaultFn: () => {
    if (this) {
      this.MobiusJS = MobiusJS
    }
  }
})
