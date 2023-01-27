<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import type { Ref } from 'vue'

const { foo } = definePropsRefs<{
  foo: string[]
}>()
expectTypeOf(foo).toEqualTypeOf<Readonly<Ref<readonly string[]>>>()
</script>

<template>
  <div>definePropsRefs</div>
  {{ foo }}
</template>
