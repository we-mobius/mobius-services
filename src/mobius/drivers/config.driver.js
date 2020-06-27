import { get, deepCopy, hardDeepMerge } from '../utils/index.js'
import { defaultConfig } from '../config/index.js'
import {
  Subject,
  merge,
  tap, map, shareReplay
} from '../libs/rx.js'
import { changeConfig, onConfigChange } from '../models/config.model.js'
import { configOut$, configIn$ } from '../domains/config/index.js'

/******************************************
 *                  Input
 ******************************************/

const makeInputSubject = () => {
  const inputSubject = new Subject()
  // NOTE:            Order matters!!!
  // newcome changes may include config's config
  // At first ConfigModel will update runtimeConfig
  // then configIn$ saves config on the basis of newly runtimeConfig
  //                                      - part of core of self-management
  inputSubject.subscribe(configChanges => {
    changeConfig(configChanges)
  })
  inputSubject.pipe(
    map(configChanges =>
      hardDeepMerge(deepCopy(defaultConfig), configChanges)
    )
  ).subscribe(configIn$)

  return inputSubject
}

/******************************************
 *                  Output
 ******************************************/

const configInitOut$ = new Subject()
const configMutationtOut$ = new Subject()

const configInitOutShare$ = configInitOut$.pipe(
  shareReplay(1)
)
const configMutationOutShare$ = configMutationtOut$.pipe(
  shareReplay(1)
)
// configOutShare$ will emit latest config while being subscribed
const configOutShare$ = merge(configInitOutShare$, configMutationOutShare$).pipe(
  shareReplay(1)
)

onConfigChange(config => {
  configMutationtOut$.next(config)
})

const _observablesMap = new Map()
const observables = {
  init: () => configOut$.pipe(
    tap(config => {
      configInitOut$.next(config)
    })
  ),
  mutation: () => configMutationOutShare$,
  hybrid: () => configOutShare$,
  select: path => {
    let res$ = _observablesMap.get(path)
    if (!res$) {
      res$ = configOutShare$.pipe(
        map(config => get(config, path)),
        shareReplay(1)
      )
      _observablesMap.set(path, res$)
    }
    return res$
  }
}

export {
  makeInputSubject as makeConfigObserver,
  observables as configObservables
}
