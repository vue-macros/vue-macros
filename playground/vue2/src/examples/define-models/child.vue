<script setup lang="ts">
let { modelValue, title } = defineModels<{
  modelValue: number
  title: string
}>()

const update = () => {
  modelValue.value++
  title.value += ' Updated!'
  debugger
}

const check = () => {
  debugger
}
</script>

<template>
  <div>
    <div>defineModels demo.</div>
    <div>value: {{ modelValue }}</div>
    <div>title: {{ title }}</div>
    <button @click="update">Update</button>
    <button @click="check">Check source map</button>
  </div>
</template>
