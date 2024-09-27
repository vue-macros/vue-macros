// Copy from: https://github.com/vuejs/core/blob/main/packages/runtime-core/src/helpers/useModel.ts

import { camelize, hasChanged, hyphenate } from '@vue/shared'
import { customRef, watchSyncEffect, type ModelRef } from 'vue'

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
  const camelizedName = camelize(name)
  const hyphenatedName = hyphenate(name)
  const modifiers = getModelModifiers(props, name)

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
        if (!hasChanged(value, localValue)) {
          return
        }
        if (
          !(
            // check if parent has passed v-model
            (
              (name in props ||
                camelizedName in props ||
                hyphenatedName in props) &&
              (`onUpdate:${name}` in props ||
                `onUpdate:${camelizedName}` in props ||
                `onUpdate:${hyphenatedName}` in props)
            )
          )
        ) {
          // no v-model, local update
          localValue = value
          trigger()
        }
        const emittedValue = options.set ? options.set(value) : value
        props[`onUpdate:${name}`]?.(emittedValue)
        // #10279: if the local value is converted via a setter but the value
        // emitted to parent was the same, the parent will not trigger any
        // updates and there will be no prop sync. However the local input state
        // may be out of sync, so we need to force an update here.
        if (
          value !== emittedValue &&
          value !== prevSetValue &&
          emittedValue === prevEmittedValue
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

const getModelModifiers = (
  props: Record<string, any>,
  modelName: string,
): Record<string, boolean> | undefined => {
  return modelName === 'modelValue' || modelName === 'model-value'
    ? props.modelModifiers
    : props[`${modelName}Modifiers`] ||
        props[`${camelize(modelName)}Modifiers`] ||
        props[`${hyphenate(modelName)}Modifiers`]
}
