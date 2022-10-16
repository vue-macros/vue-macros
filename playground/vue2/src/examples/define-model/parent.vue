<script setup lang="ts">
import { ref } from 'vue'
import Child from './child.vue'

const value = ref(0)
const title = ref('hello')
</script>

<template>
  <div>
    <child v-model="value" :title.sync="title" />
  </div>
</template>
