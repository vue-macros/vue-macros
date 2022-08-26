import { isStringLiteral } from '@babel/types'
import { computed, getCurrentInstance } from 'vue'
import { inferRuntimeType } from '../utils'
import { defineMacro } from '..'

declare global {
  const defineVModel: typeof defineVModelRuntime
}

export const defineVModel = defineMacro({
  name: 'defineVModel',
  processor: ({ component, args, typeArgs }) => {
    if (!isStringLiteral(args[0])) throw new Error('prop name must be a string')

    const propKey = args[0].value
    const eventKey = `update:${propKey}`

    component.props ||= {}
    component.props[propKey] = typeArgs[0]
      ? `[${inferRuntimeType(typeArgs[0]).join(', ')}]`
      : 'null'
    component.emits ||= {}
    component.emits[eventKey] = '() => true' // don't validate now

    return component
  },
  runtime: ['./v-model.ts', 'defineVModelRuntime'],
})

export const defineVModelRuntime = <T>(propKey: string) => {
  const { props, emit } = getCurrentInstance()!
  return computed<T>({
    get: () => props[propKey] as T,
    set: (value) => emit(`update:${propKey}`, value),
  })
}
