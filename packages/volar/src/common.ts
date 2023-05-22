import { type Segment, replace } from '@volar/vue-language-core'
import { type FileRangeCapabilities } from '@volar/language-core'

export function getVueLibraryName(vueVersion: number) {
  return vueVersion < 2.7 ? '@vue/runtime-dom' : 'vue'
}

export function addProps(
  content: Segment<FileRangeCapabilities>[],
  decl: Segment<FileRangeCapabilities>[],
  vueLibName: string
) {
  replace(
    content,
    /setup\(\) {/,
    'props: ({} as ',
    ...decl,
    '),\n',
    'setup() {'
  )
  content.push(
    `type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;\n`,
    `type __VLS_TypePropsToRuntimeProps<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? { type: import('${vueLibName}').PropType<__VLS_NonUndefinedable<T[K]>> } : { type: import('${vueLibName}').PropType<T[K]>, required: true } };\n`
  )
  return true
}

export function addEmits(
  content: Segment<FileRangeCapabilities>[],
  decl: Segment<FileRangeCapabilities>[]
) {
  const idx = content.indexOf('setup() {\n')
  if (idx === -1) return false

  replace(
    content,
    /setup\(\) {/,
    'emits: ({} as ',
    ...decl,
    '),\n',
    'setup() {'
  )
  return true
}
