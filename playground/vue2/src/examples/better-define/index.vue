<script setup lang="ts">
import Child from './child.vue'
import ReactivityTransform from './reactivity-transform.vue'
</script>

<template>
  <div>
    <Child name="" msg="" :age="10" union="" />
    <ReactivityTransform />
  </div>
</template>
