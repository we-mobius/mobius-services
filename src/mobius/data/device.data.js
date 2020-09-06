import { adaptMultiPlatform } from '../common/index.js'
import { wxmina } from '../libs/wx.js'
import { Biu } from '../libs/biu.js'

const biu = Biu.scope('inner').biu

// automatic country determination.
// @copy from: https://blog.dataflowkit.com/determine-location-of-users/
const getDeviceGeo = async () => {
  // regular expressions to extract IP and country values
  const countryCodeExpression = /loc=([\w]{2})/
  const userIPExpression = /ip=([\w.]+)/
  const res = await biu({
    url: 'https://www.cloudflare.com/cdn-cgi/trace',
    method: 'GET',
    withCredentials: false
  })
    .then(response => {
      try {
        const responseText = response.data
        const countryCode = countryCodeExpression.exec(responseText)
        const ip = userIPExpression.exec(responseText)
        if (countryCode === null || countryCode[1] === '' ||
                        ip === null || ip[1] === '') {
          throw Error('IP/Country code detection failed...')
        }
        const result = {
          countryCode: countryCode[1],
          IP: ip[1]
        }
        return result
      } catch (e) {
        throw Error(e)
      }
    })
    .catch(e => {
      console.error(e)
      return null
    })
  return res
}

const getDeviceScreen = () => {
  return new Promise((resolve, reject) => {
    let width, height
    adaptMultiPlatform({
      webFn: () => {
        width = document.documentElement.clientWidth
        height = document.documentElement.clientHeight
        resolve({ width, height })
      },
      wxminaFn: () => {
        wxmina.getSystemInfo({
          success: (res) => {
            width = res.safeArea ? res.safeArea.width : res.windowWidth
            height = res.safeArea ? res.safeArea.height : res.windowHeight
            resolve({ width, height })
          },
          fail: reject
        })
      },
      defaultFn: () => {
        reject(new Error('Can not find valid screen size info...'))
      }
    })
  }).catch(e => {
    console.error(e)
    return null
  })
}

export {
  getDeviceGeo,
  getDeviceScreen
}
