<script setup lang="ts">
const check = () => {
  debugger
}

// @ts-expect-error
defineOptions()
</script>

<template>
  <p>
    defineOptions empty demo.
    <button @click="check">Check source map</button>
  </p>
</template>
