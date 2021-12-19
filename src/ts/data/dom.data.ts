import {
  isString, isNull, isHTMLElement
} from '../libs/mobius-utils'

export const getDatasetValueFromElement = (target: string | HTMLElement, keyname: string): string | undefined => {
  if (!isString(target) && !isHTMLElement(target)) {
    throw (new TypeError('"target" is expected to be type of "String" | "HTMLElement".'))
  }

  let preparedDom: HTMLElement
  if (isString(target)) {
    const queried = document.querySelector(target)
    if (isNull(queried)) {
      throw (new Error(`Cannot find element by selector: ${target}`))
    } else {
      preparedDom = queried as HTMLElement
    }
  } else {
    preparedDom = target
  }

  return preparedDom.dataset[keyname]
}
