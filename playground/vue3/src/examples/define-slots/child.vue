<script setup lang="ts">
interface Slots {
  title: {
    foo: 'foo' | boolean
  }
  default: {
    bar: 'bar' | number
  }
}
defineSlots<Slots & { title: never }>()
</script>

<template>
  <div>defineSlots</div>
  <div>
    <slot name="title" foo="bar">title</slot>
  </div>
</template>
