<script setup lang="ts">
import { ref } from 'vue'
import Child from './child.vue'

const val = ref('')
</script>

<template>
  <div>
    <input v-model="val" />
    <child v-model:foo="val" />
  </div>

  <div>
    <input $="val" />
    <child $foo="val" />
  </div>
</template>
