import type { FileRangeCapabilities } from '@volar/language-core'
import type { Segment } from 'muggle-string'

export function getVueLibraryName(vueVersion: number) {
  return vueVersion < 2.7 ? '@vue/runtime-dom' : 'vue'
}

export function addProps(
  content: Segment<FileRangeCapabilities>[],
  decl: Segment<FileRangeCapabilities>[],
  vueLibName: string
) {
  const idx = content.indexOf('setup() {\n')
  if (idx === -1) return false
  content.splice(idx, 0, ...['props: ({} as ', ...decl, '),\n'])

  content.push(
    `type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;\n`,
    `type __VLS_TypePropsToRuntimeProps<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? { type: import('${vueLibName}').PropType<__VLS_NonUndefinedable<T[K]>> } : { type: import('${vueLibName}').PropType<T[K]>, required: true } };\n`
  )
  return true
}
