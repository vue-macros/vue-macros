<script setup lang="ts">
import { templateRef } from '@vueuse/core'
import { expectTypeOf } from 'expect-type'
import Child from './child.vue'

const child = $(templateRef(`child`))
expectTypeOf<1 | null>(child && child.foo)
</script>

<template>
  <Child ref="child" :foo="1 as const" />
</template>
