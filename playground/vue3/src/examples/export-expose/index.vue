<script setup lang="ts">
import { ref } from 'vue'
import Child from './child.vue'

const child = ref()
</script>

<template>
  <Child ref="child" />
  {{ child }}
</template>
