const Comp = defineComponent(({ bar, ...props }) => {
  const foo = defineModel('foo')
  return <div>{[foo.value, bar, props.baz]}</div>
}, { inheritAttrs: false, })

const Comp1 = defineComponent((props) => {
  const foo = defineModel('foo')
  return <div>{[foo.value, props['bar']]}</div>
})
