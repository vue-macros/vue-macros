<script setup>
import { ref } from 'vue'
const msg = ref('Hello')
</script>

<template>
  <div v-scope="{ a: 1 }">
    <span v-scope="{ b: 1 }">{{ a }}{{ b }}</span>
  </div>
</template>
