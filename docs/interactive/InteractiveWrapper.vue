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
      <div h-64 flex items-center justify-center>
        <div text-2xl>{{ t('Loading...') }}</div>
      </div>
    </template>
  </Suspense>
</template>
