<script setup lang="ts">
import Counter from './Counter.vue'

const count = $ref(0)
</script>

<template>
  <h1>Hello</h1>
  <Counter v-model="count" />
</template>
