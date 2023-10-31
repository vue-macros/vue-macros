<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { getHighlighter } from 'shikiji'
import { useData } from 'vitepress'
import {
  type OptionsKey,
  options,
  processDefineComponent,
  processDefineEmits,
  processDefineProps,
  processDefineRender,
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

const example = computed(() => {
  const props = processDefineProps[state.defineProps]
  const emits = processDefineEmits[state.defineEmits]
  const render = processDefineRender[state.defineRender]

  return processDefineComponent[state.defineComponents](
    `${props}\n${emits}`,
    render
  )
})

const formatted = ref('')
watch(
  [example, isDark],
  async () => {
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
      }
    )
  },
  { immediate: true }
)
</script>

<template>
  <div p8>
    <h1 text-6 font-bold my4>Interactive Example</h1>

    <div flex="~ col gap6">
      <div v-for="(option, key) of options" :key="key" flex="~ col gap2">
        <label>{{ option.label }}</label>
        <div flex="~ wrap gap4">
          <label v-for="value of option.values" :key="value" font-mono text-sm>
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
      <div mt4 rounded-2 p6 bg="[var(--vp-code-block-bg)]" relative>
        <span absolute top--3 font-mono op60>{{ example.filename }}</span>
        <div v-html="formatted" />
      </div>
    </div>
  </div>
</template>

<style>
.shiki {
  background-color: transparent !important;
  margin: 0;
}
</style>
