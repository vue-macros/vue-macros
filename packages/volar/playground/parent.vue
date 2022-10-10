<script setup lang="ts">
import Index from './index.vue'

// eslint-disable-next-line no-console
const log = console.log
</script>

<template>
  <Index
    title="str"
    :foo="{
      foo: 'hello foo',
    }"
    @change="(v) => log(v)"
    @update:foo="({ foo }) => log(foo)"
  />
  />
</template>
