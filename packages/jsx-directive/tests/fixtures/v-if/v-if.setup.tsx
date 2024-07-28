import { expectTypeOf } from 'expect-type'
const { foo } = defineProps<{
  foo: number
}>()

export default (
  <>
    <div v-if={foo === 0}>{expectTypeOf<0>(foo)}</div>
    <div v-if={foo ? true : false}>1</div>
  </>
)
