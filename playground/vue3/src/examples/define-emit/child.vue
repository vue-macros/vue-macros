<script setup lang="ts">
const increment = defineEmit('increment')
</script>

<template>
  <button @click="increment">increment</button>
</template>
