<script setup lang="ts">
interface Slots {
  title: {
    foo: 'foo' | boolean
  }
  default: (scope: { bar: 'bar' | number }) => any
}
defineSlots<Slots>()
</script>

<template>
  <div>defineSlots</div>
  <slot name="title" foo="foo">title</slot>
  <slot name="default" bar="bar">title</slot>
</template>
