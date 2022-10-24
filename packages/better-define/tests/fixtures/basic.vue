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
defineProps<BasicProps>()
</script>

<template>
  <slot />
</template>
