<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import type { ComputedRef } from 'vue'

const foo = defineProp<string>('foo', {
    type: String,
    required: true,
    default: 'foo'
})

const bar = defineProp<string>('bar', {
    type: [Number, Array],
    required: true,
    default: () => [1, 2, 3]
})

expectTypeOf(foo).toEqualTypeOf<ComputedRef<string>>()
expectTypeOf(bar).toEqualTypeOf<ComputedRef<number[]>>()

</script>

<template>
  <div></div>
</template>
