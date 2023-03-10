<script setup lang="ts">
import { expectTypeOf } from 'expect-type'

const foo = defineEmit<string>('foo', (payload) => typeof payload === 'string')

expectTypeOf(foo).toEqualTypeOf<(payload: string) => void>()

</script>

<template>
  <div></div>
</template>
