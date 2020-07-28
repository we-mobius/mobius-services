/* eslint-disable no-undef */
import { adaptMultiPlatform } from '../common/index.js'
import { initJWeixin } from './raw/jweixin-1.6.0'

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
