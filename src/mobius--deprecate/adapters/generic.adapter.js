const makeDriverMaker = (makeObserver, makeObservable) => {
  return () => {
    const observer = makeObserver()
    const observable$ = makeObservable()
    return input$ => {
      if (input$) {
        input$.subscribe(observer)
      }
      const output$ = observable$
      return output$
    }
  }
}

export { makeDriverMaker }
