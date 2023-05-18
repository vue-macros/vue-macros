<script setup lang="ts">
const props = withDefaults(
  simpleProps<{
    msg?: string
  }>(['msg']),
  { msg: 'foo' }
)

const emit = simpleEmits<{
  update: [msg: string]
}>(['update'])

emit('update', 'hello world')
</script>

<template>
  {{ msg }}
  <!-- boolean cast -->
  <Foo checked />
  <input type="checkbox" checked />
</template>
