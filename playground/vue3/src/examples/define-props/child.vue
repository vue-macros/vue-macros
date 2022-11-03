<script setup lang="ts">
const { foo } = $defineProps<{
  foo: string[]
}>()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fooRef = $$(foo)
</script>

<template>
  <div>defineProps</div>
  {{ foo }}
</template>
