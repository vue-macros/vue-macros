export default function(){
  const foo = defineModel('foo')
  return <div>{foo.value}</div>
}
