<script setup lang="ts">
import { Assert } from '../../assert'
import type { QInputProps } from 'quasar'

defineProps<QInputProps>()
</script>

<template>
  <Assert :l="Object.keys($props).length" :r="52" />
</template>
