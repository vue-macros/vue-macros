<script setup lang="ts">
import { defineProps } from 'unplugin-vue-macros/macros' assert { type: 'macro' }

defineProps<{
  foo?: string
  bar?: boolean
}>().withDefaults({
  foo: 'foo',
})
</script>

<template>
  {{ foo }}
  {{ bar }}
</template>
