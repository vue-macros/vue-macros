<script setup lang="ts">
type T = DefineGeneric<number>

defineProps<{
  foo: T
}>()
</script>

<template>
  {{ foo }}
</template>
