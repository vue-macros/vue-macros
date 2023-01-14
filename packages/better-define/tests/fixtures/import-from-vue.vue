<script setup lang="ts">
import { SetupProps, Num } from './export-type.exclude.vue'
import { NormalProps, Str } from './export-type-normal.exclude.vue'

export interface Props extends SetupProps {
  num: Num
}

export interface ExtendProps extends NormalProps {
  str: Str
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

defineProps<BasicProps & ExtendProps>()
defineEmits<BasicEmits>()
</script>

<template>
  <slot />
</template>
