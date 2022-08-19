export const CounterA = defineSetupComponent(() => {
  let { modelValue } = defineModel<{
    modelValue: number
  }>()

  const updateCount = (val: number) => {
    console.log((modelValue = modelValue + val))
  }

  defineRender(() => (
    <>
      <h2>SetupComponent - CounterA</h2>
      <button onClick={() => updateCount(-1)}>-</button> {''}
      {modelValue} {''}
      <button onClick={() => updateCount(+1)}>+</button>
    </>
  ))
})

export const CounterB = defineSetupComponent(() => {
  let { modelValue } = defineModel<{
    modelValue: number
  }>()

  const updateCount = (val: number) => {
    console.log((modelValue = modelValue + val))
  }

  defineRender(() => (
    <>
      <h2>SetupComponent - CounterB</h2>
      <button onClick={() => updateCount(-1)}>-</button> {''}
      {modelValue} {''}
      <button onClick={() => updateCount(+1)}>+</button>
    </>
  ))
})
