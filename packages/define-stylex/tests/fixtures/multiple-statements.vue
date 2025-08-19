<script setup lang="ts">
const a = 'a'
const stylesa = defineStyleX({ redBold: { color: 'red', fontWeight: 'bold' } }),
  stylesb = defineStyleX({ redBold: { color: 'red', fontWeight: 'bold' } })
</script>

<template>
  <p><span v-stylex="stylesa.redBold">Red</span> <span v-stylex="stylesb.redBold">{{ a }}</span></p>
</template>
