<script setup lang="ts">
import { ref } from 'vue'

const msg = ref('Hello')
</script>

<template>
  <h1 v-scope="{a: msg + ` Vue`}">{{ a }}</h1>
</template>