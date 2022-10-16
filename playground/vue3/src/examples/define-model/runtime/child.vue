<script setup lang="ts">
const { title } = defineModel<{
  title: string
}>()

const update = () => {
  title.value += ' Updated!'
  debugger
}

const check = () => {
  debugger
}
</script>

<template>
  <div>defineModel runtime demo.</div>
  <div>current value: {{ title }}</div>
  <button @click="update">Update</button>
  <button @click="check">Check source map</button>
</template>
