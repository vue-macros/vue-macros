import { reactiveComputed } from '@vueuse/core'

// eslint-disable-next-line import/no-default-export
export default (props: Record<string, any>, defaults: Record<string, any>) => {
  return reactiveComputed(() => {
    const result: Record<string, any> = {}
    for (const key of [
      ...new Set([...Object.keys(props), ...Object.keys(defaults)]),
    ]) {
      result[key] =
        props[key] ??
        (typeof defaults[key] === 'function' ? defaults[key]() : defaults[key])
    }
    return result
  })
}
