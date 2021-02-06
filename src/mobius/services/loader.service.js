import { stdLineLog } from '../libs/mobius-utils.js'
import { LOADER_TYPE } from '../const/loader.const.js'
import { loaderObservers, loaderObservables } from '../drivers/loader.driver.js'
import { ofType } from '../common/driver.common.js'

const initLoaderService = () => {
  const _sig = ['LoaderService', 'initLoaderService']
  console.log(stdLineLog(..._sig, 'start init loader service'))
  ofType(LOADER_TYPE.js, loaderObservables).subscribe(collection => {
    console.log(stdLineLog(..._sig, 'initializer of "js" type of loaderObservable receives'), collection)
  })
}

export {
  initLoaderService,
  loaderObservers, loaderObservables
}
