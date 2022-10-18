<script setup lang="ts">
const foo = 'foo'
</script>

<template name="test">
  <div>Test</div>
  <span>{{ foo }}</span>
</template>

<template>
  <span>hello</span>
  <template is="test" />
</template>
