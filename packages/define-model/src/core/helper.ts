export const emitHelperId = '/plugin-define-model/emit-helper'
export const emitHelperCode = `export default (emitFn, key, value, ...args) => {
  emitFn(key, value)
  return args.length > 0 ? args[0] : value
}`
