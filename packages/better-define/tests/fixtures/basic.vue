<script setup lang="ts">
import { CommonProps, Num } from './entry'

export type Str = string
export interface Props extends CommonProps {
  str: Str
  num: Num
}
export interface BasicProps extends Props {
  map: Map<string, string>
  arr: string[]
  union: string | number
}

export interface BasicEmits {
  (evt: 'click'): void
  (evt: 'click', action: string): void
  (evt: 'change', value: string): void
}

defineProps<BasicProps>()
defineEmits<BasicEmits>()
</script>

<template>
  <slot />
</template>
