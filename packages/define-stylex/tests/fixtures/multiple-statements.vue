<script setup lang="ts">
const a = 'a'
const stylesA = defineStyleX({ redBold: { color: 'red', fontWeight: 'bold' } }),
  stylesB = defineStyleX({ redBold: { color: 'red', fontWeight: 'bold' } })
</script>

<template>
  <p>
    <span v-stylex="stylesA.redBold">Red</span>
    <span v-stylex="stylesB.redBold">{{ a }}</span>
  </p>
</template>
