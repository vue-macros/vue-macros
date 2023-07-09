<script setup lang="ts">
const { foo: fooAlias = 'fooAlias', bar: barAlias } = defineProps<{
  foo?: string
  bar?: number
}>()
</script>

<template>
  <div>{{ fooAlias }} {{ typeof barAlias }}</div>
</template>
