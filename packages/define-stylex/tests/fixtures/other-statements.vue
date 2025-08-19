<script setup lang="ts">
// case 1: separated declarations
const a = 'a'
// case 2: multiple declarations
const styles = defineStyleX({ redBold: { color: 'red', fontWeight: 'bold' } }), b = 'b'
// case 3: separated declarations after
const c = 'c'
</script>

<template>
  <p><span v-stylex="styles.redBold">Red</span> {{ a }} {{ b }} {{ c }}</p>
</template>
