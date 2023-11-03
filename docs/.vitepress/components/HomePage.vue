<script setup lang="ts">
import { VPTeamMembers } from 'vitepress/theme'
import { computed } from 'vue'
import { useTranslate } from '../i18n/composable'

const t = useTranslate()

const members = computed(() => [
  {
    avatar: 'https://github.com/sxzz.png',
    name: '三咲智子 Kevin Deng',
    title: t('Author'),
    links: [
      { icon: 'github', link: 'https://github.com/sxzz' },
      { icon: 'twitter', link: 'https://twitter.com/sanxiaozhizi' },
    ],
  },
  {
    avatar: 'https://github.com/zhiyuanzmj.png',
    name: 'zhiyuanzmj',
    title: t('Team member'),
    links: [
      { icon: 'github', link: 'https://github.com/zhiyuanzmj' },
      { icon: 'twitter', link: 'https://twitter.com/zhiyuanzmj' },
    ],
  },
])
</script>

<template>
  <div flex="~ col wrap" mt8 items-center>
    <VPTeamMembers size="small" :members="members" />

    <h2 text="center gray xl" mt-11 pb-2>
      {{ t('Sponsored by') }}
    </h2>
    <img src="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.wide.svg" />

    <h2 text="center lg" my-5 font-bold>
      💕
      {{ t('Thanks to all the contributors!') }}
    </h2>

    <a href="https://github.com/vue-macros/vue-macros/graphs/contributors">
      <img src="https://contrib.rocks/image?repo=vue-macros/vue-macros" />
    </a>
  </div>
</template>
