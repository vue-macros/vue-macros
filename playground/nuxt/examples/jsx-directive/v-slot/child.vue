<script setup lang="tsx">
defineSlots<{
  default: () => any
  bottom: (props: { foo: 1 }) => any
}>()
</script>

<template>
  <span>
    <slot />
    <slot name="bottom" v-bind="{ foo: 1 }" />
  </span>
</template>
