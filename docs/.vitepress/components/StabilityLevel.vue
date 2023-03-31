<script setup lang="ts">
import { useData } from 'vitepress'
defineProps<{
  level: 'stable' | 'experimental' | 'deprecated'
}>()

const { lang } = useData()
</script>

<template>
  <div mt2 flex="~ gap2">
    <small>
      {{ lang === 'zh-CN' ? '稳定性：' : 'Stability: ' }}
      <code v-if="level === 'stable'" class="!text-green-600">
        {{ lang === 'zh-CN' ? '稳定' : 'stable' }}
      </code>
      <code v-else-if="level === 'experimental'" class="!text-yellow-700">
        {{ lang === 'zh-CN' ? '实验性' : 'experimental' }}
      </code>
    </small>

    <WarnBadge v-if="level === 'experimental'">
      {{
        lang === 'zh-CN'
          ? '实验性功能，风险自负'
          : 'Experimental feature, use at your risk'
      }}
    </WarnBadge>
  </div>
</template>
