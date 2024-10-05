<script setup lang="ts">
const styles = defineStyleX({ redBold: { color: 'red', fontWeight: 'bold' } })
</script>

<template>
  <p><span v-stylex="styles.redBold">Red</span> Text</p>
</template>
