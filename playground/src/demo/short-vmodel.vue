<script setup lang="ts">
import { ref } from 'vue'

const val = ref('')
</script>

<template>
  <h1>Short Vmodel</h1>
  <p>{{ val }}</p>
  <!-- prettier-ignore -->
  <input ::="val" />
</template>
