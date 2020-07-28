import { perf } from '../utils/index.js'
import { wxweb } from '../libs/wx.js'
import { mpAPIObservables } from '../drivers/mp_api.driver.js'

const initMpAPI = ({ appId }) => {
  console.log(`[${perf.now}][MpAPIService] initMpAPI: start init...`)
  return new Promise((resolve, reject) => {
    console.log(`[${perf.now}][MpAPIService] initMpAPI: trigger js_api_ticket type of mpAPIObservables ...`)
    mpAPIObservables.trigger('js_api_ticket').subscribe(jsApiTicket => {
      console.log(`[${perf.now}][MpAPIService] initMpAPI: jsApiTicket received...`, jsApiTicket)
      const { timestamp, nonceStr, signature } = jsApiTicket
      wxweb.config({
        debug: false,
        appId: appId,
        timestamp: timestamp,
        nonceStr: nonceStr,
        signature: signature,
        jsApiList: [
          'updateAppMessageShareData', 'updateTimelineShareData', 'onMenuShareWeibo', 'onMenuShareQZone',
          'startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'pauseVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice',
          'chooseImage', 'previewImage', 'uploadImage', 'downloadImage',
          'translateVoice',
          'getNetworkType', 'openLocation', 'getLocation',
          'hideOptionMenu', 'showOptionMenu', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem',
          'closeWindow',
          'scanQRCode', 'chooseWXPay', 'openProductSpecificView',
          'addCard', 'chooseCard', 'openCard'
        ]
      })
    })
    wxweb.ready(() => {
      console.log(`[${perf.now}][MpAPIService] initMpAPI: init success...`)
      resolve('done')
    })
    wxweb.error(() => {
      console.log(`[${perf.now}][MpAPIService] initMpAPI: init fail...`)
      reject(Error('JSSDK 信息验证失败...'))
    })
  })
}

export { initMpAPI, wxweb }
