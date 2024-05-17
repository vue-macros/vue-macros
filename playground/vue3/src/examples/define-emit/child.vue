<script setup lang="ts">
const inc = defineEmit('increment')
const decrement = defineEmit<[num: number]>()
</script>

<template>
  <button @click="inc">inc</button>
  <button @click="decrement(1)">dec</button>
</template>
