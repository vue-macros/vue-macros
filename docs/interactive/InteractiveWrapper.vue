<script setup lang="ts">
import { useTranslate } from '../.vitepress/i18n/composable'
import InteractiveDemo from './InteractiveDemo.vue'
const t = useTranslate()
</script>

<template>
  <Suspense>
    <InteractiveDemo />
    <template #fallback>
      <div flex justify-center items-center h-64>
        <div text-2xl>{{ t('Loading...') }}</div>
      </div>
    </template>
  </Suspense>
</template>
