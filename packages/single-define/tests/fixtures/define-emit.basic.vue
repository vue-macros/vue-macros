<script setup lang="ts">
import { expectTypeOf } from 'expect-type'

const foo = defineEmit<string>('foo')

expectTypeOf(foo).toEqualTypeOf<() => void>()

</script>

<template>
  <div></div>
</template>
