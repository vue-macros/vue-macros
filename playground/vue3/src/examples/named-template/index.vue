<script setup lang="ts">
import Child from './child.vue'
import Test from './test.vue'
</script>

<template>
  <child title="title" unit="px" unit-is-right />

  <hr />

  <child title="title" unit="px" />

  <hr />

  <test />
</template>
