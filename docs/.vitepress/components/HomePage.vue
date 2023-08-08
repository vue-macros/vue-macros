<script setup lang="ts">
import { useData } from 'vitepress'
import { VPTeamMembers } from 'vitepress/theme'
import { computed } from 'vue'

const data = useData()

const members = computed(() => [
  {
    avatar: 'https://www.github.com/sxzz.png',
    name: '三咲智子 Kevin Deng',
    title: data.lang.value === 'zh-CN' ? '作者' : 'Author',
    links: [
      { icon: 'github', link: 'https://github.com/sxzz' },
      { icon: 'twitter', link: 'https://twitter.com/sanxiaozhizi' },
    ],
  },
])
</script>

<template>
  <div flex="~ col wrap" items-center mt8>
    <VPTeamMembers size="small" :members="members" />

    <h2 text="center gray xl" mt-11 pb-2>
      {{ data.lang.value === 'zh-CN' ? '赞助者' : 'Sponsored by' }}
    </h2>
    <img src="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.wide.svg" />

    <h2 text="center lg" font-bold my-5>
      💕
      {{
        data.lang.value === 'zh-CN'
          ? '感谢所有的赞助者！'
          : 'Thanks to all the contributors!'
      }}
    </h2>

    <a href="https://github.com/vue-macros/vue-macros/graphs/contributors">
      <img src="https://contrib.rocks/image?repo=vue-macros/vue-macros" />
    </a>
  </div>
</template>
