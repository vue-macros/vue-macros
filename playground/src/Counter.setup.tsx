/* eslint-disable @typescript-eslint/no-unused-vars */

const name = /* hoist-static */ `Comp${Date.now()}`
defineOptions({
  name,
})

let { modelValue } = defineModel<{
  modelValue: number
}>()

const emit = defineEmits<{
  (evt: 'change'): void
}>()

const updateCount = (val: number) => {
  // eslint-disable-next-line no-console
  console.log((modelValue = modelValue + val))
  emit('change')
}

export default ({ updateCount, modelValue }: any) => (
  <>
    <h2>Counter</h2>
    <button onClick={() => updateCount(-1)}>-</button> {''}
    {modelValue} {''}
    <button onClick={() => updateCount(+1)}>+</button>
  </>
)
