export const makeBaseScopeManager = ({ maker } = {}) => {
  const scopeMap = new Map()
  return {
    maker: maker,
    registerScope: (scope, target, param) => {
      const _driver = scopeMap.get(scope)
      if (!_driver && !target && !maker) {
        console.error('There is no target or maker found.')
        return
      }
      if (!_driver && target) {
        scopeMap.set(scope, target)
      }
      if (!_driver && !target && maker) {
        scopeMap.set(scope, maker({ scopeName: scope, ...param }))
      }
      return scopeMap.get(scope)
    },
    scope: scope => {
      const tar = scopeMap.get(scope)
      if (tar) {
        return tar
      }
    },
    isRegisteredScope: scope => !!scopeMap.get(scope)
  }
}
