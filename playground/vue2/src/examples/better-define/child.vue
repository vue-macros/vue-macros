<script setup lang="ts">
import type { BaseEmits, BaseProps } from './types'

export interface Props extends BaseProps {
  msg: string
}
export interface Emits extends BaseEmits {
  (evt: 'click'): void
}
withDefaults(
  defineProps<
    Props & {
      union?: string | number
    }
  >(),
  { union: 'defaultValue' }
)

defineEmits<Emits>()
</script>

<template>
  <div>
    <slot />
  </div>
</template>
