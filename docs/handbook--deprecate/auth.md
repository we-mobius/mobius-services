# Auth


```javascript
// AuthingAuth
await authObservers.select('login').next({
  email: 'mobiusjs@example.com',
  password: 'mobiusjstest'
})
  .then(() => {
    return authObservers.select('userinfo').next().then(() => { console.info('userInfo got!') })
  })
  .then(() => {
    authObservers.select('logout').next().then(() => { console.info('logout') })
  })
// MpAuth
initMpAuth({
  preLogin: true,
  appId: 'appId'
})
```
