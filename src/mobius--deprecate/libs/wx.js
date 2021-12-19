/* eslint-disable no-undef */
import { adaptMultipleEnvironments } from './mobius-utils.js'
import { initJWeixin } from './raw/jweixin-1.6.0.js'

let wxmina, wxweb
adaptMultipleEnvironments({
  forWeb: () => {
    initJWeixin()
    wxweb = window.wx || window.jWeixin
  },
  forWXMINA: () => {
    wxmina = wx
  }
})

export { wxmina, wxweb }
