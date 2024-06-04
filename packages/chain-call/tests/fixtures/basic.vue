<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import { defineProps } from '../../macros' with { type: 'macro' }

const props = defineProps<{
  foo?: string
  bar?: number
  baz?: boolean
}>().withDefaults({
  foo: '111',
  bar: 111,
  baz: false,
})

expectTypeOf(props).toEqualTypeOf<{
  foo: string
  bar: number
  baz: boolean
}>()
</script>
