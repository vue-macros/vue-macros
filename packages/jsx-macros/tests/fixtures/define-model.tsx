export const Comp = ({ bar }: { bar: string }) => {
  const foo = defineModel({ default: bar })!
  return <div>{foo}</div>
}

export default function ({}) {
  const modelValue = defineModel<string>()!
  return (
    <Comp v-model:foo={modelValue.value} bar="bar">
      {modelValue.value}
    </Comp>
  )
}
