<script setup lang="ts">
import { ref } from 'vue'
import TestComp from './TestComp.vue'

const val = ref('')
</script>

<template>
  <p>Short Vmodel</p>
  <p>{{ val }}</p>

  <input v-model="val" />
  <test-comp v-model:foo="val" />

  <input $="val" />
  <test-comp $foo="val" />
</template>
