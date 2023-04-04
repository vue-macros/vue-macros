<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import { type Ref } from 'vue'

const { foo } = $defineProps<{
  foo: string[]
}>()
const fooRef = $$(foo)
expectTypeOf(fooRef).toEqualTypeOf<Ref<string[]>>()
</script>

<template>
  <div>defineProps</div>
  {{ foo }}
</template>
