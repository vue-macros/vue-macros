<script setup lang="ts">
import { Assert } from '../../assert'
defineProps<{
  checked?: any
}>()
</script>

<template>
  <Assert :l="checked" :r="true" />
</template>
