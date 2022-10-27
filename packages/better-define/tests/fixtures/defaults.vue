<script setup lang="ts">
withDefaults(defineProps<{
  foo?: string
  bar?: number
  baz?: Promise<number>
}>(), {
  foo: 'foo',
  get bar() {
    return 10
  },
  async baz() {
    return 10
  }
})
</script>

<template>
  <div />
</template>
