<script setup lang="ts">
import { VPTeamMembers } from 'vitepress/theme'
import { computed } from 'vue'
import { useTranslate } from '../i18n/composable'

const t = useTranslate()

const members = computed(() => [
  {
    avatar: 'https://github.com/sxzz.png',
    name: t('Kevin Deng'),
    title: t('Author'),
    links: [
      { icon: 'github', link: 'https://github.com/sxzz' },
      { icon: 'twitter', link: 'https://twitter.com/sanxiaozhizi' },
    ],
  },
  {
    avatar: 'https://github.com/alexzhang1030.png',
    name: 'Alex',
    title: t('Team member'),
    links: [
      { icon: 'github', link: 'https://github.com/alexzhang1030' },
      { icon: 'twitter', link: 'https://twitter.com/AlanBro23' },
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
  {
    avatar: 'https://github.com/konata33.png',
    name: 'konata33',
    title: t('Logo Designer'),
    links: [
      { icon: 'github', link: 'https://github.com/konata33' },
      { icon: 'twitter', link: 'https://twitter.com/Mrcat333' },
    ],
  },
])
</script>

<template>
  <div flex="~ col wrap" mt8 items-center px-4>
    <VPTeamMembers size="small" :members="members" w-full px-2 />

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
