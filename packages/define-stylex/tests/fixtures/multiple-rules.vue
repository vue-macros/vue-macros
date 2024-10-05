<script setup lang="ts">
const styles = defineStyleX({
  red: { color: 'red' },
  bold: { fontWeight: 'bold' },
})
</script>

<template>
  <p><span v-stylex="(styles.red, styles.bold)">Red</span> Text</p>
</template>
