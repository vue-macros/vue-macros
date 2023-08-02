const { foo = 0 } = defineProps<{
  foo: number
}>()

export default () => (
  <>
    <div v-if={foo === 0}>0</div>
    <div v-else-if={foo === 1}>1</div>
    <div v-else-if={foo === 2}>2</div>
  </>
)
