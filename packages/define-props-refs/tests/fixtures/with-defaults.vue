<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import { ComputedRef } from 'vue'
import { withDefaults } from '../../macros' with { type: 'macro' }

const { foo, bar } = withDefaults(
  definePropsRefs<{
    foo?: string
    bar?: number[]
  }>(),
  {
    foo: 'foo',
  },
)

expectTypeOf(foo).toEqualTypeOf<ComputedRef<string>>()
expectTypeOf(bar).toEqualTypeOf<ComputedRef<readonly number[] | undefined>>()
</script>
