<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import { type ComputedRef } from 'vue'
import { withDefaults } from 'unplugin-vue-macros/macros' with { type: 'macro' }
import { Assert } from '../../assert'

const { foo } = withDefaults(
  definePropsRefs<{
    foo?: string[]
  }>(),
  { foo: () => ['foobaz'] },
)
expectTypeOf(foo).toEqualTypeOf<ComputedRef<readonly string[]>>()
</script>

<template>
  <Assert :l="foo" :r="['foobaz']" />
</template>
