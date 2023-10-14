<script setup lang="ts">
import { useTranslate } from '../i18n/composable'

defineProps<{
  level: 'stable' | 'experimental' | 'deprecated'
}>()

const t = useTranslate()
</script>

<template>
  <div mt2 flex="~ gap2">
    <small>
      {{ t('Stability: ') }}
      <code v-if="level === 'stable'" class="!text-green-600">
        {{ t('stable') }}
      </code>
      <code v-else-if="level === 'experimental'" class="!text-yellow-700">
        {{ t('experimental') }}
      </code>
    </small>

    <WarnBadge v-if="level === 'experimental'">
      {{ t('Experimental feature, use at your risk') }}
    </WarnBadge>
  </div>
</template>
