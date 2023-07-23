<script setup lang="ts">
import { ref } from 'vue'

import Child from './child.vue'

const count = ref(0)
</script>

<template>
  <div>Count: {{ count }}</div>
  <Child @increment="count++" />
</template>
