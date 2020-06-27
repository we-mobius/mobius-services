import { THEME, makeThemeModeCurrency } from '../const/theme.const.js'
import { Observable } from '../libs/rx.js'
import { makeThemeObserver, themeObservables } from '../drivers/theme.driver.js'

const defaultModeHandler = mode => {
  document.documentElement.setAttribute('data-theme', mode)
}
const defaultLightSourceHandler = lightSource => {
  document.documentElement.setAttribute('data-source', lightSource.substr(0, 2))
}
const defaultIsAutoToggle = () => THEME.CONTROL.AUTOTOGGLE.OPEN

const initTheme = ({
  modeHandler = defaultModeHandler,
  lightSourceHandler = defaultLightSourceHandler,
  isAutoToggle = defaultIsAutoToggle
}) => {
  themeObservables.select(THEME.TYPE.MODE).subscribe(({ value }) => {
    modeHandler(value)
  })
  themeObservables.select(THEME.TYPE.LIGHTSOURCE).subscribe(({ value }) => {
    lightSourceHandler(value)
  })
  const darkModeMediaQuery$ = new Observable(observer => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    darkModeMediaQuery.addListener(e => {
      const mode = e.matches ? THEME.MODE.DARK : THEME.MODE.LIGHT
      if (isAutoToggle() === 'open') {
        observer.next(makeThemeModeCurrency(mode))
      }
    })
  })
  darkModeMediaQuery$.subscribe(makeThemeObserver())
}

export { makeThemeObserver, themeObservables, initTheme }
