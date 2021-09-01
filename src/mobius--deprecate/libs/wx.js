/* eslint-disable no-undef */
import { adaptMultiPlatform } from './mobius-utils.js'
import { initJWeixin } from './raw/jweixin-1.6.0.js'

let wxmina, wxweb
adaptMultiPlatform({
  webFn: () => {
    initJWeixin()
    wxweb = window.wx || window.jWeixin
  },
  wxminaFn: () => {
    wxmina = wx
  }
})

export { wxmina, wxweb }
