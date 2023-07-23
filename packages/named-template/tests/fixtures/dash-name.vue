<script lang="ts" setup>
// https://github.com/sxzz/vue-macros/issues/261
</script>

<template name="btn-content">
  <div class="btn-content">
    <slot />
  </div>
</template>

<template>
  <div class="a-btn">
    <template is="btn-content"></template>
  </div>
</template>
