<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useTranslate } from '../.vitepress/i18n/composable'

const InteractiveDemo = defineAsyncComponent(
  () => import('./InteractiveDemo.vue'),
)
const t = useTranslate()
</script>

<template>
  <Suspense>
    <InteractiveDemo />
    <template #fallback>
      <div mt10 h-64 flex flex-col items-center justify-center gap2>
        <div i-ri:loader-2-line animate-spin text="16" />
        <div animate-pulse text-xl>{{ t('Loading...') }}</div>
      </div>
    </template>
  </Suspense>
</template>
