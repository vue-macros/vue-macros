<script setup lang="ts">
import { ref } from 'vue'
import { Ok } from '../../assert'
export const foo = ref('foo')
export const bar = 'bar'

setTimeout(() => {
  foo.value = 'new'
}, 5)
</script>

<template>
  <Ok />
</template>
