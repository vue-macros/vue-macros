<script setup lang="tsx">
defineSlots<{
  default: () => any
  title: (props: { foo: 1 }) => any
  bottom: (props: { foo: 1 }) => any
  center: (props: { foo: 1 }) => any
  bodyLeft: (props: { foo: 1 }) => any
}>()
</script>

<template>
  <span>
    <slot />
    <slot name="bottom" v-bind="{ foo: 1 }" />
  </span>
</template>
