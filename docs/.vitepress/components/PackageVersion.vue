<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <a
    ml2
    inline-block
    :href="`https://www.npmjs.com/package/${name}`"
    target="_blank"
  >
    <img alt="NPM Version" :src="`https://img.shields.io/npm/v/${name}`" />
  </a>
</template>
