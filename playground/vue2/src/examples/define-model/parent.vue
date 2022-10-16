<script setup lang="ts">
import { ref } from 'vue'
import Child from './child.vue'

const title = ref('hello')
</script>

<template>
  <div>
    <child :title.sync="title" />
  </div>
</template>
