<script setup lang="ts">
import Child from './child.vue'
</script>

<template>
  <!-- @vue-expect-error -->
  <Child :foo="1" bar="1" />
  <Child :foo="1" :bar="2" />
</template>
