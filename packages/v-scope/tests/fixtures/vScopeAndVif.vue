<script setup>
import { ref } from 'vue'

const ok = ref(true)
</script>

<template>
  <div v-if="ok" v-scope="{ a: 1 }">
    {{ a }}
  </div>
</template>
