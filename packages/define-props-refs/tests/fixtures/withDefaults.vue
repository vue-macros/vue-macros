<script setup lang="ts">
const { foo, bar } = withDefaults(definePropsRefs<{
  foo: string
  bar: number
}>(), {
  foo: 'foo',
  bar: 1
})
</script>

<template>
  <div></div>
</template>
