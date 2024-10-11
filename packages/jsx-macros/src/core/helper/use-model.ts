// Modified from: https://github.com/vuejs/core/blob/main/packages/runtime-core/src/helpers/useModel.ts

import { customRef, watchSyncEffect, type ModelRef } from 'vue'

const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue)

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
  name: string,
  options: DefineModelOptions = {},
): any {
  const modifiers =
    name === 'modelValue' ? props.modelModifiers : props[`${name}Modifiers`]

  const res = customRef((track, trigger) => {
    let localValue: any = options?.default
    let prevSetValue: any
    let prevEmittedValue: any

    watchSyncEffect(() => {
      const propValue = props[name]
      if (hasChanged(localValue, propValue)) {
        localValue = propValue
        trigger()
      }
    })

    return {
      get() {
        track()
        return options.get ? options.get(localValue) : localValue
      },

      set(value) {
        const emittedValue = options.set ? options.set(value) : value
        if (
          !hasChanged(emittedValue, localValue) &&
          !(prevSetValue !== undefined && hasChanged(value, prevSetValue))
        ) {
          return
        }
        if (
          !(
            props &&
            // check if parent has passed v-model
            props[name] !== undefined &&
            props[`onUpdate:${name}`] !== undefined
          )
        ) {
          // no v-model, local update
          localValue = value
          trigger()
        }

        props[`onUpdate:${name}`]?.(emittedValue)
        // #10279: if the local value is converted via a setter but the value
        // emitted to parent was the same, the parent will not trigger any
        // updates and there will be no prop sync. However the local input state
        // may be out of sync, so we need to force an update here.
        if (
          hasChanged(value, emittedValue) &&
          hasChanged(value, prevSetValue) &&
          !hasChanged(emittedValue, prevEmittedValue)
        ) {
          trigger()
        }
        prevSetValue = value
        prevEmittedValue = emittedValue
      },
    }
  })

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
