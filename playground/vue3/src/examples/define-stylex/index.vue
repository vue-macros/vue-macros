<script setup lang="ts">
const styles = defineStyleX({
  red: { color: 'red' },
  bold: { fontWeight: 'bold' },
  redBold: { color: 'red', fontWeight: 'bold' },
})
</script>

<template>
  <p v-stylex="styles.red">Red Text</p>
  <p v-stylex="styles.bold">Bold Text</p>
  <p v-stylex="(styles.red, styles.bold)">Red and Bold Text</p>
  <p v-stylex="styles.redBold">Red and Bold Text</p>
</template>
