<script setup lang="ts">
import Child from './child.vue'
</script>

<template>
  <div>
    <child>
      <template #title />

      <template #foo="{ foo }">
        {{ foo }}
      </template>

      <template #default="{ bar }">{{ bar }}</template>
    </child>
  </div>
</template>
