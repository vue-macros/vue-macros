<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import { defineProps } from '../../macros' with { type: 'macro' }

const props = defineProps<{
  bar?: boolean
}>().withDefaults({
  bar: true,
})
expectTypeOf(props).toEqualTypeOf<{
  bar: boolean
}>()
</script>

<template>
  {{ props }}
</template>
