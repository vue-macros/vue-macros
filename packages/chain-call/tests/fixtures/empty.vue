<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import { Prettify, defineProps } from '../../macros' assert { type: 'macro' }

const props = defineProps().withDefaults({})
expectTypeOf<Prettify<typeof props>>().toEqualTypeOf<{}>()
</script>
