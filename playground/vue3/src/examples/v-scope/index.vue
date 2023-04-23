<script setup>
import { ref } from 'vue'

const msg = ref('Hello')
</script>

<template>
  <h1 v-scope="{ a: msg + ` Vue` }">{{ a }}</h1>
  <div v-for="i in [1, 2, 3]" :key="i" v-scope="{ x: i + 1 }">{{ x }}</div>
</template>
