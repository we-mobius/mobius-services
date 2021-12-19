import { perf, adaptMultipleEnvironments } from '../libs/mobius-utils.js'
import { THEME, makeThemeModeCurrency } from '../const/theme.const.js'
import { Observable, tap, take } from '../libs/rx.js'
import { wxmina } from '../libs/wx.js'
import { makeThemeObserver, themeObservables } from '../drivers/theme.driver.js'
import { configObservables } from '../drivers/config.driver.js'

const defaultModeHandler = mode => {
  document.documentElement.setAttribute('data-theme', mode)
}
const defaultLightSourceHandler = lightSource => {
  document.documentElement.setAttribute('data-source', lightSource.substr(0, 2))
}
const defaultIsAutoToggle = () => THEME.CONTROL.AUTOTOGGLE.OPEN

let firstGetCompleted = false
let firstSaveCompleted = false
const adjustToSystemMode = () => {
  console.log(`[${perf.now}][ThemeService] attempt to adjustToSystemMode...`)
  if (firstGetCompleted && firstSaveCompleted) {
    adaptMultipleEnvironments({
      forWeb: () => {
        const mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME.MODE.DARK : THEME.MODE.LIGHT
        console.log(`[${perf.now}][ThemeService](web) adjustToSystemMode...`, mode)
        // NOTE: put it to next tick
        setTimeout(() => {
          makeThemeObserver().next(makeThemeModeCurrency(mode))
        }, 0)
      },
      forWXMINA: ({ wxmina }) => {
        wxmina.getSystemInfo({
          success: (res) => {
            const mode = res.theme === 'dark' ? THEME.MODE.DARK : THEME.MODE.LIGHT
            console.log(`[${perf.now}][ThemeService](wxmina) adjustToSystemMode...`, mode)
            // NOTE: put it to next tick
            setTimeout(() => {
              makeThemeObserver().next(makeThemeModeCurrency(mode))
            }, 0)
          }
        })
      }
    })
  }
}

/**
 * - add theme change handler
 *   - initialize theme auto adjust on first loaded
 * - register theme autochange events
 * - add handlers for save theme stuffs
 */
const initTheme = ({
  modeHandler = defaultModeHandler,
  lightSourceHandler = defaultLightSourceHandler,
  isAutoToggle = defaultIsAutoToggle
} = {
  modeHandler: defaultModeHandler,
  lightSourceHandler: defaultLightSourceHandler,
  isAutoToggle: defaultIsAutoToggle
}) => {
  console.log(`[${perf.now}][ThemeService] initTheme: add theme change handler...`)
  themeObservables.select(THEME.TYPE.MODE).subscribe(({ value }) => {
    console.log(`[${perf.now}][ThemeService] initTheme: themeObservables modeHandler receives mode change...`, value)
    modeHandler(value)
    if (!firstGetCompleted) {
      console.log(`[${perf.now}][ThemeService] initTheme: firstGetCompleted...`)
      firstGetCompleted = true
      if (isAutoToggle()) {
        adjustToSystemMode()
      }
    }
  })
  themeObservables.select(THEME.TYPE.LIGHTSOURCE).subscribe(({ value }) => {
    console.log(`[${perf.now}][ThemeService] initTheme: themeObservables lightSourceHandler receives lightSource change...`, value)
    lightSourceHandler(value)
  })

  // NOTE: will not triggerd when first loaded
  console.log(`[${perf.now}][ThemeService] initTheme: register theme autochange events...`)
  const darkModeChangeEmitter$ = new Observable(observer => {
    adaptMultipleEnvironments({
      forWeb: () => {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        darkModeMediaQuery.addEventListener('change', e => {
          const mode = e.matches ? THEME.MODE.DARK : THEME.MODE.LIGHT
          if (isAutoToggle() === 'open') {
            observer.next(makeThemeModeCurrency(mode))
          }
        })
      },
      forWXMINA: ({ wxmina }) => {
        wxmina.onThemeChange(mode => {
          mode = mode === 'dark' ? THEME.MODE.DARK : THEME.MODE.LIGHT
          if (isAutoToggle() === 'open') {
            observer.next(makeThemeModeCurrency(mode))
          }
        })
      }
    })
  })
  darkModeChangeEmitter$.subscribe(makeThemeObserver())

  console.log(`[${perf.now}][ThemeService] initTheme: add handlers for save theme stuffs...`)
  configObservables.select('repository.theme.saveTo')
    .pipe(
      tap(saveTo => {
        console.log(`[${perf.now}][ThemeService] initTheme: repository.theme.saveTo changes to...`, saveTo)
      })
    ).subscribe(() => {
      themeObservables.select(THEME.TYPE.MODE)
        .pipe(take(1))
        .subscribe(modeCurrency => {
          console.log(`[${perf.now}][ThemeService] initTheme: tempModeSubscription triggered...`, modeCurrency)
          makeThemeObserver().next(modeCurrency)
          if (!firstSaveCompleted) {
            console.log(`[${perf.now}][ThemeService] initTheme: firstSaveCompleted...`)
            firstSaveCompleted = true
            if (isAutoToggle()) {
              adjustToSystemMode()
            }
          }
        })
      themeObservables.select(THEME.TYPE.LIGHTSOURCE)
        .pipe(take(1))
        .subscribe(lightSourceCurrency => {
          console.log(`[${perf.now}][ThemeService] initTheme: tempLightSourceSubscription triggered...`, lightSourceCurrency)
          makeThemeObserver().next(lightSourceCurrency)
        })
    })
}

export { makeThemeObserver, themeObservables, initTheme }
