import {
  isPlainObject,
  Biutor, adaptMultipleEnvironments
} from '../libs/mobius-utils'

// @refer https://dev.to/brojenuel/get-ip-clients-addresses-6k6

export interface DeviceGeoFromCloudflare {
  fl: string // 12f744
  h: string // www.cloudflare.com
  ip: string // 161.129.60.142
  /**
   * Timestamp of request (in seconds)
   * @example
   * 1639906878.062
   */
  ts: string
  visit_scheme: string // https
  /**
   * User agent
   * @example
   * Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 Edg/96.0.1054.57
   */
  uag: string
  colo: string // LAX
  http: string // http/2
  /**
   * Location
   * @example
   * US
   */
  loc: string
  tls: string // TLSv1.3
  sni: string // plaintext
  warp: string // off
  gateway: string // off
}

const parseDeviceGeoFromCloudflare = (text: string): DeviceGeoFromCloudflare => {
  const pairs = text.split('\n').map((pair: string) => pair.split('=')).filter(([key]) => key !== '')
  const result = pairs.reduce((acc: Partial<DeviceGeoFromCloudflare>, pair) => {
    const [key, name] = pair
    acc[key as keyof DeviceGeoFromCloudflare] = name
    return acc
  }, {})

  return result as DeviceGeoFromCloudflare
}
/**
 * @refer https://dataflowkit.com/blog/determine-location-of-users/
 */
export const getDeviceGeoFromCloudflare = (): Biutor<DeviceGeoFromCloudflare> => {
  return Biutor.of({
    url: 'https://www.cloudflare.com/cdn-cgi/trace',
    method: 'GET',
    dataType: 'custom',
    dataParser: parseDeviceGeoFromCloudflare,
    withCredentials: false
  }).sendRequest()
}

export interface DeviceScreenInfo {
  width: number
  height: number
}

export const getDeviceScreenInfo = (): DeviceScreenInfo => {
  const result = adaptMultipleEnvironments({
    forWXMINA: ({ wxmina }) => {
      const systemInfo = wxmina.getSystemInfoSync()
      const { safeArea, windowWidth, windowHeight } = systemInfo
      const width = isPlainObject(safeArea) ? safeArea.width : windowWidth
      const height = isPlainObject(safeArea) ? safeArea.height : windowHeight
      return ({ width, height })
    },
    forWeb: ({ document }) => {
      const width = document.documentElement.clientWidth
      const height = document.documentElement.clientHeight
      return ({ width, height })
    },
    forDefault: () => {
      throw (new Error('Can not find valid screen size info...'))
    }
  })
  return result
}
