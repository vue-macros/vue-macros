<script setup lang="ts">
const props = simpleProps<{
  msg: string
}>(['msg'])
</script>

<template>
  {{ msg }}
  <!-- boolean cast -->
  <Foo checked />
  <input type="checkbox" checked />
</template>
