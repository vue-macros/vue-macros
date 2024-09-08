import { camelize, type ModelRef } from 'vue'

type DefineModelOptions<T = Record<string, any>> = {
  default?: any
  get?: (v: T) => any
  set?: (v: T) => any
}
export function useModel<
  M extends PropertyKey,
  T extends Record<string, any>,
  K extends keyof T,
>(props: T, name: K, options?: DefineModelOptions<T[K]>): ModelRef<T[K], M>
export function useModel(
  props: Record<string, any>,
  name: string = 'modelValue',
  options: DefineModelOptions = {},
): any {
  name = camelize(name)
  const modifiers = getModelModifiers(props, name)
  const res = {
    get value() {
      const result = props[name] ?? options?.default
      return options?.get ? options.get(result) : result
    },
    set value(v) {
      props[`onUpdate:${name}`]?.(v)
    },
    __v_isRef: true,
  }

  // @ts-expect-error
  res[Symbol.iterator] = () => {
    let i = 0
    return {
      next() {
        if (i < 2) {
          return { value: i++ ? modifiers || {} : res, done: false }
        } else {
          return { done: true }
        }
      },
    }
  }
  return res
}

export const getModelModifiers = (
  props: Record<string, any>,
  modelName: string,
): Record<string, true | undefined> | undefined => {
  return modelName === 'modelValue'
    ? props.modelModifiers
    : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`]
}
