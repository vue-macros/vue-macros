<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import { type Ref } from 'vue'
import { Assert } from '../../assert'

const { foo } = $defineProps<{
  foo: string[]
}>()
const fooRef = $$(foo)
expectTypeOf(fooRef).toEqualTypeOf<Ref<string[]>>()
</script>

<template>
  <Assert :l="foo" :r="['foo']" />
</template>
