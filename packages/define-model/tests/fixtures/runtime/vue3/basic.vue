<script setup lang="ts">
const { modelValue } = defineModel<{
  modelValue: string
  visible: boolean
}>()

console.log(modelValue.value)
modelValue.value = 'newValue'
</script>

<template>
  <h1>123</h1>
</template>
