export const makeBaseScopeManager = () => {
  const scopeMap = new Map()
  return {
    registerScope: (scope, driver) => {
      const _driver = scopeMap.get(scope)
      if (!_driver && driver) {
        scopeMap.set(scope, driver)
      }
      return scopeMap.get(scope)
    },
    scope: scope => scopeMap.get(scope)
  }
}
