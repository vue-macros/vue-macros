<script setup lang="ts">
const props = simpleProps<{
  msg: string
}>(['msg'])
</script>

<template>
  {{ msg }}
</template>
