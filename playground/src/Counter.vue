<script setup lang="ts">
const name = /* hoist-static */ `Comp${Date.now()}`
defineOptions({
  name,
})

let { modelValue } = defineModel<{
  modelValue: number
}>()

const emit = defineEmits<{
  (evt: 'change'): void
}>()

const updateCount = (val: number) => {
  // eslint-disable-next-line no-console
  console.log((modelValue = modelValue + val))
  emit('change')
}
</script>

<template>
  <button @click="updateCount(-1)">-</button>
  {{ modelValue }}
  <button @click="updateCount(1)">+</button>
</template>
