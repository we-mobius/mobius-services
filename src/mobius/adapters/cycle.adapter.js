const makeCycleDriverMaker = (makeObserver, makeObservable, adapt) => {
  return () => {
    const observer = makeObserver()
    const observable$ = makeObservable()
    return input$ => {
      if (input$) {
        // nice move
        input$.addListener ? input$.addListener(observer) : input$.subscribe(observer)
      }
      const output$ = adapt ? adapt(observable$) : observable$
      return output$
    }
  }
}

export { makeCycleDriverMaker }
