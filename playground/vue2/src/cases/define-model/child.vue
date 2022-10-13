<script setup lang="ts">
let { count } = defineModel<{
  count: number
}>()

const inc = () => {
  count++
  debugger
}

const dec = () => {
  count--
}
</script>

<template>
  <div>
    <button @click="dec">-</button>
    <span> {{ count }} </span>
    <button @click="inc">+</button>
  </div>
</template>
