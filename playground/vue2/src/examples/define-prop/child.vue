<script setup lang="ts">
const foo = defineProp(0)
const bar = defineProp('default', false)
const baz = defineProp<boolean>()
</script>

<template>
  <div>
    <p>foo: {{ foo }}</p>
    <p>bar: {{ bar }}</p>
    <p>baz: {{ baz }}</p>
  </div>
</template>
