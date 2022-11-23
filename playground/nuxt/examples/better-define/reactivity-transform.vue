<script setup lang="ts">
const { foo = 'foo' } = defineProps<{
  foo?: string
}>()

console.log(foo)
</script>

<template>
  {{ foo }}
</template>
