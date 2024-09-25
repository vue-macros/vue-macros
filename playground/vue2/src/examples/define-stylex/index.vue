<script setup lang="ts">
const styles = defineStyleX({ red: { color: 'red' } })
</script>

<template>
  <p v-stylex="styles.red">Red Text</p>
</template>

<style>
@stylex stylesheet;
</style>
