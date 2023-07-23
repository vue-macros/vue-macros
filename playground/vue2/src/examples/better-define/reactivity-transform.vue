<script setup lang="ts">
import { Assert } from '../../assert'

const { foo = 'foo' } = defineProps<{
  foo?: string
}>()
</script>

<template>
  <Assert :l="foo" r="foo" />
</template>
