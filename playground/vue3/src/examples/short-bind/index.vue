<script setup lang="ts">
import { ref } from 'vue'
import Child from './child.vue'

const value = ref('')
</script>

<template>
  <input :value />
  <Child $value />
</template>
