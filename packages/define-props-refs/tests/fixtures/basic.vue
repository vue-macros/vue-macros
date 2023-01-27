<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import type { Ref } from 'vue'

const { foo, bar } = definePropsRefs<{
  foo: string[]
  bar: number
}>()
expectTypeOf(foo).toEqualTypeOf<Ref<string[]>>()
expectTypeOf(bar).toEqualTypeOf<Ref<number>>()
</script>

<template>
  <div></div>
</template>
