<script setup lang="ts">
import { type QInputProps } from 'quasar'
import { Assert } from '../../assert'

defineProps<QInputProps>()
</script>

<template>
  <Assert :l="Object.keys($props).length" :r="52" />
</template>
