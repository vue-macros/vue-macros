<script setup lang="ts">
import AllHoist from './all-hoist.vue'

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
  <all-hoist />
</template>
