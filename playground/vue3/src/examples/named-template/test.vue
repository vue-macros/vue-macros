<script setup lang="ts">
const msg = 'foo'
console.log(msg)
</script>

<template name="test">
  {{ msg }}
</template>

<template>
  <div>Test</div>
  <template is="test" />
</template>
