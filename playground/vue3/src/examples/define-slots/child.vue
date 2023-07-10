<script setup lang="ts">
import { Fail, Ok } from '../../assert'

interface Slots {
  title: {
    foo: 'foo' | boolean
  }
  default: (scope: { bar: 'bar' | number }) => any
}
defineSlots<Slots>()
</script>

<template>
  <slot name="title" foo="foo">
    <Ok />
  </slot>
  <slot name="default" bar="bar">
    <Fail />
  </slot>
</template>
