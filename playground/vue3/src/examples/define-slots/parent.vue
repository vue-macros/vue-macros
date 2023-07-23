<script setup lang="ts">
import { Assert } from '../../assert'
import Child from './child.vue'
</script>

<template>
  <child>
    <template #title />

    <template #default="{ bar }">
      <Assert :l="bar" r="bar" />
    </template>

    <template #any="{ any }">
      {{ any }}
    </template>
  </child>
</template>
