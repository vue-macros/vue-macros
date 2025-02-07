<script setup lang="ts">
import pluginBabel from 'prettier/plugins/babel'
import pluginEstree from 'prettier/plugins/estree'
import pluginHtml from 'prettier/plugins/html'
import pluginTypeScript from 'prettier/plugins/typescript'
import { format } from 'prettier/standalone'
import { createHighlighterCoreSync } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import langTsx from 'shiki/langs/tsx.mjs'
import langTypeScript from 'shiki/langs/typescript.mjs'
import langVue from 'shiki/langs/vue.mjs'
import themeVitesseDark from 'shiki/themes/vitesse-dark.mjs'
import themeVitesseLight from 'shiki/themes/vitesse-light.mjs'
import { useData } from 'vitepress'
import { computed, onServerPrefetch, reactive, ref, watch } from 'vue'
import { useTranslate } from '../.vitepress/i18n/composable'
import {
  conflictCases,
  options,
  processDefineComponent,
  processDefineEmits,
  processDefineProps,
  processDefineRender,
  type OptionsKey,
} from './logic'
import type { ShikiTransformer } from 'shiki'

const t = useTranslate()
const { isDark } = useData()

const shiki = createHighlighterCoreSync({
  themes: [themeVitesseLight, themeVitesseDark],
  langs: [langTypeScript, langTsx, langVue],
  engine: createJavaScriptRegexEngine(),
})

const state = reactive<{
  -readonly [K in OptionsKey]: (typeof options)[K]['values'][number]
}>(
  Object.fromEntries(
    Object.entries(options).map(([key, value]) => [key, value.default]),
  ) as any,
)

const example = computed(() => {
  const topLevel = `import { ref } from 'vue'`
  const ref = `\nconst count = ref(0)\n`
  const props = processDefineProps[state.defineProps]
  const emits = processDefineEmits[state.defineEmits]
  const render = processDefineRender[state.defineRender]

  return processDefineComponent[state.defineComponents](
    `${props}\n${emits}${ref}`,
    render,
    topLevel,
  )
})

const transformers: ShikiTransformer[] = [
  {
    name: 'vitepress:add-class',
    pre(node) {
      this.addClassToHast(node, 'vp-code')
    },
  },
  {
    name: 'vitepress:clean-up',
    pre(node) {
      delete node.properties.style
    },
  },
]

const formatted = ref('')
async function formatCode() {
  formatted.value = shiki.codeToHtml(
    await format(example.value.code, {
      parser: example.value.lang === 'vue' ? 'vue' : 'babel-ts',
      plugins: [pluginBabel, pluginHtml, pluginEstree, pluginTypeScript],
      semi: false,
      singleQuote: true,
    }),
    {
      lang: example.value.lang === 'vue' ? 'vue' : 'typescript',
      theme: isDark.value ? 'vitesse-dark' : 'vitesse-light',
      transformers,
    },
  )
}
watch([example, isDark], formatCode, { immediate: true })

function isConflicted(value: string) {
  const items = conflictCases
    .map((items) => {
      if (!items.includes(value)) return null
      return items.filter((item) => item !== value)
    })
    .filter((i): i is string[] => !!i)
    .flat()
  if (items.length === 0) return false

  const values: string[] = Object.values(state)
  if (!items.some((another) => values.includes(another))) return false

  return true
}

onServerPrefetch(() => formatCode())
</script>

<template>
  <div p8 class="interactive-example">
    <h1 mb8 text-7 font-bold>{{ t('Interactive Example') }}</h1>

    <div flex="~ col gap6">
      <div v-for="(option, key) of options" :key="key" flex="~ col gap2">
        <label>{{ option.label }}</label>
        <div flex="~ wrap gap4">
          <template v-for="value of option.values" :key="value">
            <label
              v-if="!isConflicted(value)"
              flex="~ gap1"
              items-center
              text-sm
              font-mono
            >
              <button
                :class="['custom-button', { active: state[key] === value }]"
                @click="(state[key] as any) = value as any"
              >
                {{ value }}
              </button>
            </label>
          </template>
        </div>
      </div>
      <div class="vp-doc">
        <div class="language-vue">
          <button title="Copy Code" class="copy" />
          <span class="lang">vue</span>
          <div v-html="formatted" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.interactive-example .shiki {
  background-color: transparent !important;
  margin: 0;
}
.custom-button {
  border-radius: 0.25rem;
  background-color: rgba(169, 169, 169, 0.1);
  padding: 0.125rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  transition:
    background-color 0.3s,
    color 0.3s;
}

.custom-button:hover {
  background-color: rgba(169, 169, 169, 0.2);
}

.custom-button.active {
  background: #e576ff;
  color: #ffffff;
}
</style>
