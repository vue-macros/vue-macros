<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import type { DeepReadonly, Ref } from 'vue'

const { foo, bar } = definePropsRefs<{
  foo: string[]
  bar: number
}>()
expectTypeOf(foo).toEqualTypeOf<DeepReadonly<Ref<string[]>>>()
expectTypeOf(bar).toEqualTypeOf<DeepReadonly<Ref<number>>>()
</script>

<template>
  <div></div>
</template>
