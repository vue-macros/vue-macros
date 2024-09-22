const Comp = defineComponent(({ bar }: { bar: string }) => {
  const foo = defineModel('foo')
  return <div>{[foo.value, bar]}</div>
})

const SetupComp = defineSetupComponent(({ foo }: { foo: string }) => {
  return <div>{foo}</div>
})

const SetupCompType: SetupFC = ({ foo }: { foo: string }) => {
  return <div>{foo}</div>
}
