<script setup lang="ts">
const { modelValue } = defineModel<{
  modelValue: number
}>()
const emit = defineEmits<any>()

const updateCount = (val: number) => {
  // eslint-disable-next-line vue/require-explicit-emits
  emit('update:modelValue', modelValue + val)
}
</script>

<template>
  <button @click="updateCount(-1)">-</button>
  {{ modelValue }}
  <button @click="updateCount(1)">+</button>
</template>
