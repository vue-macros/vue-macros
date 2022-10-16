<script setup lang="ts">
let { title } = defineModel<{
  title: string
}>()

const update = () => {
  title += ' Updated!'
  debugger
}

const check = () => {
  debugger
}
</script>

<template>
  <div>defineModel demo.</div>
  <div>current value: {{ title }}</div>
  <button @click="update">Update</button>
  <button @click="check">Check source map</button>
</template>
