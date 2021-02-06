import VConsole from 'vconsole'
import { perf } from '../libs/mobius-utils.js'

const initVConsole = () => {
  const vConsole = new VConsole()
  console.log(`[${perf.now}][ConsoleService] initVConsole...`, vConsole)
}
const initConsole = () => {
  initVConsole()
}

export { initConsole, initVConsole }
