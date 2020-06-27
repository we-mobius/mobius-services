const makeDriverMaker = (makeObserver, makeObservable) => {
  return (input$) => {
    const observer = makeObserver()
    const observable$ = makeObservable()
    return (input$) => {
      input$.subscribe(observer)
      const output$ = observable$
      return output$
    }
  }
}

export { makeDriverMaker }
