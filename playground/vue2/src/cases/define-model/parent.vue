<script setup lang="ts">
import { ref } from 'vue'
import Child from './child.vue'

const count = ref(0)
</script>

<template>
  <!-- eslint-disable-next-line vue/no-deprecated-v-bind-sync -->
  <child :count.sync="count" />
</template>
