<script setup lang="ts">
import { $$ } from 'vue/macros'
import { expectTypeOf } from 'expect-type'
import type { Ref } from 'vue'

const { foo, bar } = $defineProps<{
  foo: string[]
  bar: Ref<number>
}>()
const fooRef = $$(foo)
const barRef = $$(bar)
expectTypeOf(fooRef).toEqualTypeOf<Ref<string[]>>()
expectTypeOf(barRef).toEqualTypeOf<Ref<Ref<number>>>()
</script>

<template>
  <div></div>
</template>
