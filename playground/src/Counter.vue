<script setup lang="ts">
const { modelValue } = defineModel<{
  modelValue: number
}>()
const emit = defineEmits<{}>()

const updateCount = (val: number) => {
  // @ts-expect-error
  emit('update:modelValue', modelValue + val)
}
</script>

<template>
  <button @click="updateCount(-1)">-</button>
  {{ modelValue }}
  <button @click="updateCount(1)">+</button>
</template>
