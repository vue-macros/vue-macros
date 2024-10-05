<script setup lang="ts">
defineProps<{ bold?: boolean }>()
const styles = defineStyleX({
  red: { color: 'red' },
  bold: { fontWeight: 'bold' },
})
</script>

<template>
  <p><span v-stylex="(styles.red, bold && styles.bold)">Red</span> Text</p>
</template>
