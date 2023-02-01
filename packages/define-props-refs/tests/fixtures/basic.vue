<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import type { ComputedRef, DeepReadonly, Ref } from 'vue'

const { foo, bar } = definePropsRefs<{
  foo: string[]
  bar: number
}>()
expectTypeOf(foo).toEqualTypeOf<ComputedRef<readonly string[]>>()
expectTypeOf(bar).toEqualTypeOf<ComputedRef<number>>()
</script>

<template>
  <div></div>
</template>
