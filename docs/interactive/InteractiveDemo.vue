<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, reactive, ref, watch } from 'vue'
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

const t = useTranslate()
const { isDark } = useData()

const [
  shiki,
  { format },
  pluginBabel,
  pluginTypeScript,
  pluginHtml,
  pluginEstree,
] = await Promise.all([
  import('shiki').then(({ getHighlighter }) =>
    getHighlighter({
      themes: ['vitesse-light', 'vitesse-dark'],
      langs: ['typescript', 'vue'],
    }),
  ),
  import('prettier/standalone'),
  import('prettier/plugins/babel'),
  import('prettier/plugins/typescript'),
  import('prettier/plugins/html'),
  import('prettier/plugins/estree') as Promise<any>,
])

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
      },
    )
  },
  { immediate: true },
)

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
      <div bg="[var(--vp-code-block-bg)]" relative mt4 rounded-2 p6>
        <span absolute right-4 top-4 font-mono op60>
          {{ example.filename }}
        </span>
        <div overflow-auto v-html="formatted" />
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
