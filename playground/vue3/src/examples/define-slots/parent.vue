<script setup lang="ts">
import Child from './child.vue'
</script>

<template>
  <child>
    <template #title="{ foo }">
      {{ foo }}
    </template>

    <template #foo="{ foo }">
      {{ foo }}
    </template>
  </child>
</template>
