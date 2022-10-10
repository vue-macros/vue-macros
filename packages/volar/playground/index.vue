<script setup lang="ts">
import type { Foo } from './types'

defineProps<{
  title: string
}>()

defineModel<{
  foo: Foo
}>()

const emit = defineEmits<{
  (evt: 'change', val: string): void
}>()

emit('change', 'newValue')
</script>

<template>
  <div>
    <slot />
  </div>
</template>
