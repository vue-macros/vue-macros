export const Comp = ({ bar }: { bar: string }) => {
  const foo = defineModel('foo', { default: bar })
  return <div>{foo.value}</div>
}

export default function () {
  const foo = $(defineModel('foo'))
  return <div>{foo}</div>
}
