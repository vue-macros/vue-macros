<script setup lang="ts">
withDefaults(defineProps<{
  foo?: string

}>(), {
  ['f' + 'oo']: 'foo'
})
</script>

<template>
  <div />
</template>
