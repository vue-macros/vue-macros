<script setup lang="ts">
var { modelValue } = $defineModel<{
  modelValue: string
  visible: boolean
}>()

console.log(modelValue)
modelValue = 'newValue'
</script>

<template>
  <h1>123</h1>
</template>
