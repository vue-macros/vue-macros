<script setup lang="ts">
type T = DefineGeneric<number>

defineProps<{
  foo: T
  bar: T
}>()
</script>

<template>
  {{ foo }}
</template>
