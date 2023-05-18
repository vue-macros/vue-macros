<script setup>
import { ref } from 'vue'

const ok = ref(1)
</script>

<template>
  <div v-if="ok == 1" v-scope="{ a: 1 }">
    {{ a }}
  </div>
  <div v-else-if="ok == 2" v-scope="{ b: 2 }">
    {{ b }}
  </div>

  <div v-else v-scope="{ c: 3 }">
    {{ c }}
  </div>
</template>
