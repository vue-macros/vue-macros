<script setup lang="ts">
import { $$, ReactiveVariable } from 'vue/macros'
import { expectTypeOf } from 'expect-type'
import type { Ref } from 'vue'

const { foo, bar } = $defineProps<{
  foo: string[]
  bar: Ref<number>
}>()
expectTypeOf(foo).toEqualTypeOf<ReactiveVariable<string[]>>()
const fooRef = $$(foo)
const barRef = $$(bar)
expectTypeOf(fooRef).toEqualTypeOf<Ref<string[]>>()
expectTypeOf(barRef).toEqualTypeOf<Ref<Ref<number>>>()

const { baz } = $defineProps({
  baz: String,
})
expectTypeOf(baz).toEqualTypeOf<ReactiveVariable<string> | undefined>()

const { qux, quux } = $defineProps(['qux', 'quux'])
</script>

<template>
  <div></div>
</template>
