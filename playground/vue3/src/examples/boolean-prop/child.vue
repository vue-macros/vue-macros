<script setup lang="ts">
import { Assert } from '../../assert'
defineProps<{
  checked?: boolean
  enabled: boolean
}>()
</script>

<template>
  <Assert :l="checked" :r="true" />
  <Assert :l="enabled" :r="false" />
</template>
