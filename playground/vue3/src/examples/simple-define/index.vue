<script setup lang="ts">
import { toRef } from 'vue'

const props = withDefaults(
  simpleProps<{
    foo?: string
    obj?: { foo: string }
    fn?: () => number
  }>(['foo']),
  {
    foo: 'bar',
    obj: () => ({ foo: 'bar' }),
    fn: () => () => 123,
  },
)

const foo = toRef(() => props.foo)
const obj = toRef(() => props.obj)
const fn = toRef(() => props.fn)
</script>

<template>
  <p>foo: {{ foo }} ({{ typeof foo }})</p>
  <p>obj: {{ obj }} ({{ typeof obj }})</p>
  <p>fn: {{ fn }} ({{ typeof fn }})</p>
</template>
