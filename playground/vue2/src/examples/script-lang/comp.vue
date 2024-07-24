<script setup>
defineProps<{
  foo: string
}>()
</script>

<template>
  <div>
    {{ foo }}
  </div>
</template>
