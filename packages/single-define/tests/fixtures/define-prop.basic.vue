<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import type { ComputedRef } from 'vue'

const foo = defineProp<string>('foo')

expectTypeOf(foo).toEqualTypeOf<ComputedRef<string>>()

</script>

<template>
  <div></div>
</template>
