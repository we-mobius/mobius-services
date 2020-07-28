import {
  THEME,
  isValidThemeType, isValidThemeMode, isValidThemeLightSource,
  makeThemeModeCurrency, makeThemeLightSourceCurrency,
  isThemeModeCurrency, isThemeLightSourceCurrency
} from '../const/index.js'
import {
  Subject,
  merge,
  filter, shareReplay
} from '../libs/rx.js'
import {
  modeIn$, modeOut$,
  lightSourceIn$, lightSourceOut$
} from '../domains/theme/theme.repository.js'
import {
  changeMode, changeLightSource, onModeChange, onLightSourceChange
} from '../models/theme.model.js'

/******************************************
 *                  Input
 ******************************************/

const makeInputSubject = () => {
  const inputSubject = new Subject()
  // 两种不同的订阅方式源于 model 和 repository 的不同实现策略
  inputSubject
    .pipe(filter(isThemeModeCurrency))
    .subscribe(({ value }) => {
      changeMode(value)
    })
  inputSubject
    .pipe(filter(isThemeLightSourceCurrency))
    .subscribe(({ value }) => {
      changeLightSource(value)
    })
  inputSubject
    .pipe(filter(isThemeModeCurrency))
    .subscribe(modeIn$)
  inputSubject
    .pipe(filter(isThemeLightSourceCurrency))
    .subscribe(lightSourceIn$)
  return inputSubject
}

/******************************************
 *                  Output
 ******************************************/

const modeInitOut$ = modeOut$
const lightSourceInitOut$ = lightSourceOut$
const modeMutationOut$ = new Subject()
const lightSourceMutationOut$ = new Subject()

onModeChange((mode) => {
  // effect 必执行一次,加上判断避免广播无效 mode 值
  if (isValidThemeMode(mode)) {
    modeMutationOut$.next(makeThemeModeCurrency(mode))
  }
})
onLightSourceChange((lightSource) => {
  // effect 必执行一次,加上判断避免广播无效 lightSource 值
  if (isValidThemeLightSource(lightSource)) {
    lightSourceMutationOut$.next(makeThemeLightSourceCurrency(lightSource))
  }
})

const modeOutShare$ = merge(modeInitOut$, modeMutationOut$).pipe(
  shareReplay(1)
)
const lightSourceOutShare$ = merge(lightSourceInitOut$, lightSourceMutationOut$).pipe(
  shareReplay(1)
)

const observables = {
  hybrid: () => merge(modeOutShare$, lightSourceOutShare$).pipe(
    shareReplay(1)
  ),
  select: type => {
    if (!isValidThemeType(type)) throw Error(`传入的 type 值无效，传入值为 ${type}`)
    let res$
    switch (type) {
      case THEME.TYPE.MODE:
        res$ = modeOutShare$
        break
      case THEME.TYPE.LIGHTSOURCE:
        res$ = lightSourceOutShare$
        break
    }
    return res$
  }
}

export {
  makeInputSubject as makeThemeObserver,
  observables as themeObservables
}
