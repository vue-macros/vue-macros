<script setup lang="ts">
import { ref } from 'vue'
import Child from './child.vue'

const val = ref('')
</script>

<template>
  <p>{{ val }}</p>

  <input v-model="val" />
  <child v-model:foo="val" />

  <input $="val" />
  <child $foo="val" />
</template>
