<script setup lang="ts">
import { ref } from 'vue'
import Child from './child.vue'

const child = ref<InstanceType<typeof Child>>()
</script>

<template>
  <Child ref="child" />
  {{ child?.bar }}
</template>
