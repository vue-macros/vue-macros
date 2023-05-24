<script setup lang="ts">
const { title, none } = defineModels<{
  title: string
  none?: ModelOptions<string, { defaultValue: 'initial value' }>
}>()

const update = () => {
  title.value += ' Updated!'
  none.value += ' Updated!'
  debugger
}

const check = () => {
  debugger
}
</script>

<template>
  <div>defineModels demo.</div>
  <div>current value: {{ title }}</div>
  <div>none: {{ none }}</div>
  <button @click="update">Update</button>
  <button @click="check">Check source map</button>
</template>
