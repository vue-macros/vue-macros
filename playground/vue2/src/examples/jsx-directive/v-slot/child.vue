<script setup lang="tsx">
defineSlots<{
  default: () => any
  bottom: (props: { foo: 1 }) => any
}>()

defineEmits<{
  log: [id: number]
}>()
</script>

<template>
  <span @click="$emit('log', 1)">
    <slot />
    <slot name="bottom" v-bind="{ foo: 1 }" />
  </span>
</template>
