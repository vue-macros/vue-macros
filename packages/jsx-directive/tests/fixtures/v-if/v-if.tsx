const { foo } = defineProps<{
  foo: number
}>()

export default () => {
  return (
    <>
      <div v-if={foo === 0}>0</div>
      <div v-if={foo === 1}>1</div>
    </>
  )
}
