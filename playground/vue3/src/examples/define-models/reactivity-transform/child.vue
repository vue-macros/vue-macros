<script setup lang="ts">
let { title } = $defineModels<{
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
  <div>$defineModels demo.</div>
  <div>current value: {{ title }}</div>
  <button @click="update">Update</button>
  <button @click="check">Check source map</button>
</template>
