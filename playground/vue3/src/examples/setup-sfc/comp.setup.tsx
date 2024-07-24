import { expectTypeOf } from 'expect-type'

const { foo } = defineProps<{
  foo: number
}>()

/**
 * ## Vue JSX is the future
 */
export default (
  <div>
    <div v-if={foo === 1}>{expectTypeOf<1>(foo)}</div>
    <div v-else-if={foo === 2}>{expectTypeOf<2>(foo)}</div>
  </div>
)
