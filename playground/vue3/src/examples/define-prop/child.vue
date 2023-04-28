<script setup lang="ts">
const foo = defineProp<string>('foo')
const bar = defineProp<string>()
</script>

<template>
  <p>foo: {{ foo }}</p>
  <p>bar: {{ bar }}</p>
</template>
