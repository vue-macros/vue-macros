<script setup lang="tsx" generic="T">
defineProps<{
  baz?: T
}>()

defineSlots<{
  default: () => any
  title: (props: { foo: T }) => any
  bottom: (props: { foo: 1 }) => any
  center: (props: { foo: 1 }) => any
  'bot-tom': (props: { foo: 1 }) => any
}>()
</script>

<template>
  <span>
    <slot />
    <slot name="bottom" v-bind="{ foo: 1 }" />
  </span>
</template>
