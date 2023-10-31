export const options = {
  defineComponents: {
    values: ['Vue SFC', 'setupSFC', 'setupComponent'],
    default: 'Vue SFC',
    label: 'Define Component',
  },
  defineProps: {
    values: [
      'defineProps',
      'definePropsRefs',
      'defineProp',
      'exportProps',
      'chainCall',
    ],
    default: 'defineProps',
    label: 'Define Props',
  },
  // defineEmits: {
  //   values: ['defineEmits', 'defineEmit'],
  //   default: 'defineEmits',
  //   label: 'Define Emits',
  // },
} as const

export type OptionsKey = keyof typeof options
export type DefineComponents =
  (typeof options)['defineComponents']['values'][number]
export type DefineProps = (typeof options)['defineProps']['values'][number]
// type DefineEmits = (typeof options)['defineEmits']['values'][number]

const propsType = `{\n foo?: string, bar?: number }`
export const processDefineProps: Record<DefineProps, string> = {
  defineProps: `
  const props = withDefaults(
    defineProps<${propsType}>(), {
      bar: 0
    }
  )`,

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

export const processDefineComponent: Record<
  DefineComponents,
  (setup: string) => string
> = {
  'Vue SFC': (setup) => `<script setup lang="ts">${setup}</${'script'}>`,
  setupSFC: (setup) => setup,
  setupComponent: (setup) => `export const App: SetupFC = () => {\n${setup}\n}`,
}
