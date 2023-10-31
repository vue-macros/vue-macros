export const options = {
  defineComponents: {
    values: ['Vue SFC', 'setupSFC', 'setupComponent'],
    default: 'Vue SFC',
    label: 'Define Component',
  },
  defineProps: {
    values: [
      'defineProps',
      'prop destructure',
      'defineProp',
      'definePropsRefs',
      'chainCall',
      'exportProps',
    ],
    default: 'defineProps',
    label: 'Define Props',
  },
  defineEmits: {
    values: ['defineEmits', 'defineEmit'],
    default: 'defineEmits',
    label: 'Define Emits',
  },
  defineRender: {
    values: ['<template>', 'defineRender', 'exportRender'],
    default: '<template>',
    label: 'Define Render',
  },
} as const

export type OptionsKey = keyof typeof options
export type DefineComponents =
  (typeof options)['defineComponents']['values'][number]
export type DefineProps = (typeof options)['defineProps']['values'][number]
type DefineEmits = (typeof options)['defineEmits']['values'][number]
type DefineRender = (typeof options)['defineRender']['values'][number]

const propsType = `{\n foo?: string, bar?: number }`
export const processDefineProps: Record<DefineProps, string> = {
  defineProps: `
  const props = withDefaults(
    defineProps<${propsType}>(), {
      bar: 0
    }
  )`,

  'prop destructure': `const { foo, bar = 0 } = defineProps<${propsType}>()`,

  definePropsRefs: `
  const { foo, bar } = withDefaults(
    definePropsRefs<${propsType}>(), {
      bar: 0
    }
  )`,

  defineProp: `
  const foo = defineProp<string>();
  const bar = defineProp<string>('bar', { default: 0 })`,

  exportProps: `
  export let foo: string
  export const bar = 0`,

  chainCall: `const props = defineProps<${propsType}>().withDefaults({\n bar: 0 })`,
}

export const processDefineEmits: Record<DefineEmits, string> = {
  defineEmits: `
  const emit = defineEmits<{
    increment: [value: number]
    decrement: []
  }>()
  emit('increment', 1)
  emit('decrement')
  `,
  defineEmit: `
  const increment = defineEmit<[value: number]>()
  const decrement = defineEmit<[]>()
  increment(1)
  decrement()
  `,
}

type Lang = 'ts' | 'tsx' | 'vue'
type Render = { code: string; setup: string; lang: Lang }

export const processDefineRender: Record<DefineRender, Render> = {
  '<template>': {
    code: `\n\n<template><div>{{ count }}</div></template>`,
    setup: '',
    lang: 'ts',
  },
  defineRender: {
    code: '',
    setup: `defineRender(<div>{ count }</div>)`,
    lang: 'tsx',
  },
  exportRender: {
    code: '',
    setup: 'export default () => <div>{ count }</div>',
    lang: 'tsx',
  },
}

export const processDefineComponent: Record<
  DefineComponents,
  (
    setup: string,
    render: Render
  ) => {
    code: string
    lang: Lang
    filename: string
  }
> = {
  'Vue SFC': (setup, render) => ({
    code: `<script setup lang="${render.lang}">${setup}\n${
      render.setup
    }</${'script'}>${render.code}`,
    lang: 'vue',
    filename: 'App.vue',
  }),
  setupSFC: (setup, render) => ({
    code: `${setup}\n${render.setup}`,
    lang: render.lang,
    filename: `App.setup.${render.lang}`,
  }),
  setupComponent: (setup, render) => ({
    code: `export const App: SetupFC = () => {\n${setup}\n${render.setup}}`,
    lang: render.lang,
    filename: `App.${render.lang}`,
  }),
}
