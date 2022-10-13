<script setup lang="ts">
defineOptions({
  name: 'CodeGroupItem',
  inheritAttrs: false,
})

defineProps<{
  title: string
  active: boolean
}>()
</script>
<template>
  <div v-if="active" class="content"><slot /></div>
</template>
<style scoped>
.content :deep(div[class*='language-']) {
  border-radius: 0;
  border-top: none;
  margin: 0;
}
</style>
