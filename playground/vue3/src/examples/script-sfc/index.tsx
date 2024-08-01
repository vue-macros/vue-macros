import { expectTypeOf } from 'expect-type'

export default ({ foo }: { foo: number }) => (
  <div v-if={foo === 1}>{expectTypeOf<1>(foo)}</div>
)
