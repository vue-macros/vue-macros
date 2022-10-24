<script setup lang="ts">
import { CommonProps, Num } from './entry'

export type Str = string

defineProps<
  CommonProps & { str: Str; num: Num } & {
    map: Map<string, string>
    arr: string[]
    union: string | number
  }
>()
</script>

<template>
  <slot />
</template>
