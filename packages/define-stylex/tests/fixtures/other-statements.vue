<script setup lang="ts">
// separated declarations before
const a = 'a'
// multiple declarations
const b = 'b',
  styles = defineStyleX({ redBold: { color: 'red', fontWeight: 'bold' } }),
  c = 'c'
// separated declarations after
const d = 'd'
</script>

<template>
  <p>
    <span v-stylex="styles.redBold">Red</span> {{ a }} {{ b }} {{ c }} {{ d }}
  </p>
</template>
