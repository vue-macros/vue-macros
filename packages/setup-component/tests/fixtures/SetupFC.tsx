import { expectTypeOf } from 'expect-type'
import type { SetupFC } from '../../macros'
import { VNode, ref } from 'vue'

export const App: SetupFC<
  { name: string },
  { update(value: string): void },
  { default: (scope: { msg: string }) => VNode }
> = (props, { emit, slots }) => {
  expectTypeOf(props).toEqualTypeOf<
    {
      name: string
    } & {
      onUpdate?: (value: string) => any
    }
  >()
  expectTypeOf(emit).toEqualTypeOf<(event: 'update', value: string) => void>()
  expectTypeOf(slots).toEqualTypeOf<
    Readonly<{
      default: (scope: { msg: string }) => VNode
    }>
  >()

  const count = ref(0)

  return () => (
    <div>
      <p>hi, this is {props.name}</p>
      <p>{count.value}</p>
      <button onClick={() => count.value++}>inc</button>
    </div>
  )
}
