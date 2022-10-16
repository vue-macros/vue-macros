export const helperPrefix = '/plugin-define-model'

export const emitHelperId = `${helperPrefix}/emit-helper`
export const emitHelperCode = `export default (emitFn, key, value, ...args) => {
  emitFn(key, value)
  return args.length > 0 ? args[0] : value
}`

export const useVmodelHelperId = `${helperPrefix}/use-vmodel`
export const useVmodelHelperCode = `import { getCurrentInstance } from 'vue';
import { useVModel } from '@vueuse/core';
export default (...keys) => {
  const props = getCurrentInstance().proxy.$props
  const ret = {}
  for (const [key, eventName] of keys)
    ret[key] = useVModel(props, key, undefined, { eventName })
  return ret
}
`
