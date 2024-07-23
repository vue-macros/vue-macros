import { useVModel, type UseVModelOptions } from '@vueuse/core'
import { getCurrentInstance, type Ref } from 'vue'

export default (
  ...keys: (
    | string
    | [string, string | undefined, string | undefined, UseVModelOptions<any>]
  )[]
): Record<string, Ref<any>> => {
  const props = getCurrentInstance()!.proxy!.$props as Record<string, any>
  const ret: Record<string, Ref<any>> = Object.create(null)
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
        ...(options as any),
      })
    }
  }
  return ret
}
