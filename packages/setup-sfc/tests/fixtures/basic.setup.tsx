import {} from 'vue'

defineProps<{
  foo: string
}>()

export default () => {
  // @ts-ignore
  return <div />
}
