<script setup lang="ts">
const { foo = 'foo', ...props } = defineProps<{
  foo?: string
}>()

console.log(foo, props)
</script>

<template>
  <div>
    Reactivity Transform on Vue 2 Demo.
    {{ foo }}
  </div>
</template>
