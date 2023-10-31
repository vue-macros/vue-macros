<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { getHighlighter } from 'shikiji'
import { useData } from 'vitepress'
import {
  type OptionsKey,
  options,
  processDefineComponent,
  processDefineProps,
} from './logic'

const { isDark } = useData()

const shiki = await getHighlighter({
  themes: ['vitesse-light', 'vitesse-dark'],
  langs: ['typescript', 'vue'],
})

const { format } = await import('prettier/standalone')
const pluginBabel = await import('prettier/plugins/babel')
const pluginTypeScript = await import('prettier/plugins/typescript')
const pluginHtml = await import('prettier/plugins/html')
const pluginEstree: any = await import('prettier/plugins/estree')

const state = reactive<{
  -readonly [K in OptionsKey]: (typeof options)[K]['values'][number]
}>(
  Object.fromEntries(
    Object.entries(options).map(([key, value]) => [key, value.default])
  ) as any
)

const code = computed(() => {
  const setup = processDefineProps[state.defineProps]
  return processDefineComponent[state.defineComponents](setup)
})

const formatted = ref('')
watch(
  [code, isDark],
  async () => {
    formatted.value = shiki.codeToHtml(
      await format(code.value, {
        parser: state.defineComponents === 'Vue SFC' ? 'vue' : 'babel-ts',
        plugins: [pluginBabel, pluginHtml, pluginEstree, pluginTypeScript],
        semi: false,
        singleQuote: true,
      }),
      {
        lang: state.defineComponents === 'Vue SFC' ? 'vue' : 'typescript',
        theme: isDark.value ? 'vitesse-dark' : 'vitesse-light',
      }
    )
  },
  { immediate: true }
)
</script>

<template>
  <div p8 font-mono>
    <h1 text-6 font-bold my4>Interactive Example</h1>

    <div flex="~ col gap4">
      <div v-for="(option, key) of options" :key="key" flex="~ gap2 wrap">
        <label w-45>{{ option.label }}:</label>
        <div flex="~ wrap gap4">
          <label v-for="value of option.values" :key="value">
            <input
              v-model="state[key]"
              :name="key"
              type="radio"
              :value="value"
            />
            {{ value }}
          </label>
        </div>
      </div>

      <div mt2>
        <span>
          {{ state.defineComponents === 'Vue SFC' ? 'App.vue' : 'App.tsx' }}
        </span>
        <div v-html="formatted" />
      </div>
    </div>
  </div>
</template>

<style>
.shiki {
  background-color: transparent !important;
  margin-top: 0;
}
</style>
