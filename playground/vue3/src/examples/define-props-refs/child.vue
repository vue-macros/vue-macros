<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import { withDefaults } from 'unplugin-vue-macros/macros' assert { type: 'macro' }
import { Assert } from '../../assert'
import type { ComputedRef } from 'vue'

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
