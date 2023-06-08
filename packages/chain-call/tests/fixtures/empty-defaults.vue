<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import { Prettify, defineProps } from '../../macros' assert { type: 'macro' }

const props = defineProps<{
  foo?: string
}>().withDefaults()

expectTypeOf<Prettify<typeof props>>().toEqualTypeOf<{
  readonly foo?: string
}>()
</script>
