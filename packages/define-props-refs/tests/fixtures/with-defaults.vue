<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import { ComputedRef } from 'vue'

const { foo, bar } = withDefaults(
  definePropsRefs<{
    foo: string
    bar: number[]
  }>(),
  {
    foo: 'foo',
    bar: () => [1, 2, 3],
  }
)

expectTypeOf(foo).toEqualTypeOf<ComputedRef<string>>()
expectTypeOf(bar).toEqualTypeOf<ComputedRef<readonly number[]>>()
</script>
