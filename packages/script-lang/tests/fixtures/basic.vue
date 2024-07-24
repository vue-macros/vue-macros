<script>
export const bar: number = 1
</script>

<script setup>
defineProps<{
  foo: string
}>()
</script>

<template>
  {{ foo }}
</template>
