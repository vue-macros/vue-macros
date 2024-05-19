<script setup lang="ts">
import { ref } from 'vue'
import Child from './child.vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const value = ref('')
</script>

<template>
  <input :value />
  <Child $value />
</template>
