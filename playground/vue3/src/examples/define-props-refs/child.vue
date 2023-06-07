<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import { type ComputedRef } from 'vue'
import { withDefaults } from 'unplugin-vue-macros/macros' assert { type: 'macro' }

const { foo } = withDefaults(
  definePropsRefs<{
    foo?: string[]
  }>(),
  { foo: () => ['foo'] }
)
expectTypeOf(foo).toEqualTypeOf<ComputedRef<readonly string[]>>()
</script>

<template>
  {{ foo }}
</template>
