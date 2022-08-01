<script setup lang="ts">
let { modelValue } = defineModel<{
  modelValue: number
}>()

const emit = defineEmits<{
  (evt: 'change'): void
}>()

const updateCount = (val: number) => {
  modelValue = modelValue + val
  emit('change')
}
</script>

<template>
  <button @click="updateCount(-1)">-</button>
  {{ modelValue }}
  <button @click="updateCount(1)">+</button>
</template>
