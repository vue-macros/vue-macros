<script setup lang="ts">
const Trigger = {
  click: 'click',
  focus: 'focus',
  hover: 'hover',
} as const

const props = defineProps<{
  trigger: keyof typeof Trigger | Array<keyof typeof Trigger>
}>()
</script>

<template>
  <button>{{ trigger }}</button>
</template>
