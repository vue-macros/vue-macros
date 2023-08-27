<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
const modelValue = ref('')
</script>

<template>
  <input :value />
  <input :modelValue />
  <input :model-value />
</template>
