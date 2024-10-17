import { watch } from 'vue'

export const Comp = defineComponent(function <const T>({ foo }: { foo: T }) {
  const slots = defineSlots({
    default: (props: { bar: string }) => <div>{props.bar}</div>,
  })

  const [modelValue, modifiers] = defineModel<string, 'trim'>({
    required: true,
    get(value) {
      if (modifiers.trim) return value.trim()
      return value
    },
    set(value) {
      if (modifiers.trim) return value.trim()
      return value
    },
  })
  watch(
    modelValue,
    () => {
      console.log(modelValue.value)
    },
    { immediate: true },
  )

  defineExpose({
    foo,
  })

  return (
    <div>
      <input v-model={modelValue.value}></input>
      <slots.default bar={modelValue.value}></slots.default>
    </div>
  )
})
