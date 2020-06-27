const perf = {
  get now () {
    return Math.round(performance.now())
  }
}

export { perf }
