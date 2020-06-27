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
      localStorageKeyName: 'jsrt_mobius-auth',
      authingOptions: {
        userPoolId: ''
      }
    },
    theme: {
      localStorageKeyName: 'jsrt_mobius-theme'
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
      saveTo: 'runtime' // local, runtime
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
