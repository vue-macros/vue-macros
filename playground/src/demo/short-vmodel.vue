<script setup lang="ts">
import { ref } from 'vue'
import TestComp from './TestComp.vue'

const val = ref('')
</script>

<template>
  <h1>Short Vmodel</h1>
  <p>{{ val }}</p>

  <input v-model="val" />
  <test-comp v-model:foo="val" />

  <input $="val" />
  <test-comp $foo="val" />
</template>
