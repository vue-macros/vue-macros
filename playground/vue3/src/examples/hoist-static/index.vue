<script setup lang="ts">
const key1 = 'title'
const key2 = `title${2}`
defineProps([key1, key2])

const check = () => {
  debugger
}
</script>

<template>
  <div>
    hoist-static demo.
    <button @click="check">Check source map</button>
  </div>
</template>
