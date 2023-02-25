<script setup lang="ts">
const pager = 'top'
</script>

<template name="pager">
  <span>This is pager</span>
</template>

<template>
  <template v-if="pager === 'top'">
    <template is="pager" />
  </template>

  <span>Here is data table</span>

  <template v-if="pager === 'bottom'">
    <template is="pager" />
  </template>
</template>
