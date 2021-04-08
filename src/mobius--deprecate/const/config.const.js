// jsrt -> jsruntime

const INIT_CONFIG = {
  util: {},
  common: {
    baseFingerPrint: 'cigaret'
  },
  config: {},
  const: {},

  lib: {},
  data: {
    config: {
      localStorageKeyName: 'jsrt_mobius-config',
      requestInfo: {
        getConfigUrl: '',
        setConfigUrl: ''
      }
    },
    auth: {
      authing: {
        localStorageKeyName: 'jsrt_mobius-authingauth',
        authingOptions: {
          userPoolId: ''
        }
      },
      mp: {
        localStorageKeyName: 'jsrt_mobius-mpauth',
        requestInfo: {
          loginUrl: '',
          getUserInfoUrl: ''
        }
      }
    },
    theme: {
      localStorageKeyName: 'jsrt_mobius-theme',
      requestInfo: {
        getThemeUrl: '',
        setThemeUrl: ''
      }
    },
    mp_api: {
      requestInfo: {
        getAPITicketUrl: ''
      }
    },
    payment: {
      wepay: {
        requestInfo: {
          getWepayParamsUrl: '',
          getTradeStateUrl: ''
        }
      }
    }
  },
  domain: {},
  repository: {
    config: {
      saveTo: 'runtime' // sever, local, runtime
    },
    theme: {
      saveTo: 'runtime' // server, local, runtime
    },
    auth: {
      authing: {
        saveTo: 'runtime' // local, runtime
      }
    }
  },
  usecase: {},
  model: {},
  driver: {},

  service: {
    theme: {
      autoToggle: 'open' // open, close
    }
  },

  adapter: {},
  presenter: {},
  enhancement: {}
}

export { INIT_CONFIG }
