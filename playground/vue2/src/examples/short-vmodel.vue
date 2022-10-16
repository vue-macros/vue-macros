<script setup lang="ts">
import { ref } from 'vue'

const val = ref('')
</script>

<template>
  <p>Short Vmodel</p>
  <p>{{ val }}</p>
  <input $="val" />
</template>
