import { getCurrentInstance } from 'vue'
import { useVModel } from '@vueuse/core'

export default (...keys) => {
  const props = getCurrentInstance().proxy.$props
  const ret = {}
  for (const _k of keys) {
    if (typeof _k === 'string') {
      ret[_k] = useVModel(props, _k, undefined, {
        eventName: `update:${_k}`,
        passive: true,
      })
    } else {
      const [key, prop = key, eventName = `update:${key}`, options = {}] = _k
      ret[key] = useVModel(props, prop, undefined, {
        eventName,
        passive: true,
        ...options,
      })
    }
  }
  return ret
}
