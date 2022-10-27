<script setup lang="ts">
import type { BaseProps } from './types'

export interface Props extends BaseProps {
  msg: string
}
withDefaults(
  defineProps<
    Props & {
      union?: string | number
    }
  >(),
  {
    union: 'defaultValue',
  }
)
</script>

<template>
  <div>
    <slot />
  </div>
</template>
