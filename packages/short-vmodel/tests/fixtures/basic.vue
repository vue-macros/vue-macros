<script setup lang="ts">
import { ref } from 'vue'

const val = ref('')
</script>

<template>
  <!-- prettier-ignore -->
  <A ::="val" />
  <A ::foo="val" />
</template>
