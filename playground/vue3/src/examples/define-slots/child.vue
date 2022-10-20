<script setup lang="ts">
interface Slots {
  title: {
    foo: 'bar' | boolean
  }
}
defineSlots<Slots>()
</script>

<template>
  <div>
    <slot name="title" foo="bar" />
  </div>
</template>
