<script setup lang="ts">
import Child from './child.vue'
import Test from './test.vue'

const o = { [1]: 2 }
</script>

<template>
  <div v-for="k in o" />

  <child title="title" unit="px" unit-is-right />

  <hr />

  <child title="title" unit="px" />

  <hr />

  <test />
</template>
