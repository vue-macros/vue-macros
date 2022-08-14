<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../macros/macros-global" />

defineProps<{
  foo: string
}>()

defineModel<{
  foo: string
}>()
</script>

<template>
  <div>
    <slot />
  </div>
</template>
