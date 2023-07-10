<script setup lang="ts">
const inc = defineEmit('increment')
</script>

<template>
  <button @click="inc">inc</button>
</template>
