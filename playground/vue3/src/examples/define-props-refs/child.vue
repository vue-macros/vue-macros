<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import type { ComputedRef } from 'vue'

const { foo } = definePropsRefs<{
  foo: string[]
}>()
expectTypeOf(foo).toEqualTypeOf<ComputedRef<readonly string[]>>()
</script>

<template>
  <div>definePropsRefs</div>
  {{ foo }}
</template>
