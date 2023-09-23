<script setup lang="ts">
const { value } = defineModels<{
  value: string
}>()
</script>

<template>
  <input v-model="value" />
</template>
