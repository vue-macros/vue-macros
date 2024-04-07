import {
  type FileRangeCapabilities,
  type Segment,
  type Sfc,
  type VueCompilerOptions,
  replaceAll,
} from '@vue/language-core'
import type { VolarOptions } from '..'

export function getVueLibraryName(vueVersion: number) {
  return vueVersion < 2.7 ? '@vue/runtime-dom' : 'vue'
}

export function addProps(
  content: Segment<FileRangeCapabilities>[],
  decl: Segment<FileRangeCapabilities>[],
  vueLibName: string,
) {
  replaceAll(
    content,
    /setup\(\) {/g,
    'props: ({} as ',
    ...decl,
    '),\n',
    'setup() {',
  )
  content.push(
    `type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;\n`,
    `type __VLS_TypePropsToRuntimeProps<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? { type: import('${vueLibName}').PropType<__VLS_NonUndefinedable<T[K]>> } : { type: import('${vueLibName}').PropType<T[K]>, required: true } };\n`,
  )
  return true
}

export function addEmits(
  content: Segment<FileRangeCapabilities>[],
  decl: Segment<FileRangeCapabilities>[],
) {
  replaceAll(
    content,
    /setup\(\) {/g,
    'emits: ({} as ',
    ...decl,
    '),\n',
    'setup() {',
  )
  return true
}

export function getVolarOptions(
  vueCompilerOptions: VueCompilerOptions,
): VolarOptions | undefined {
  return vueCompilerOptions.vueMacros
}

export function getImportNames(
  ts: typeof import('typescript/lib/tsserverlibrary'),
  sfc: Sfc,
) {
  const names: string[] = []
  const sourceFile = sfc.scriptSetup!.ast
  sourceFile.forEachChild((node) => {
    if (
      ts.isImportDeclaration(node) &&
      node.assertClause?.elements.some(
        (el) =>
          el.name.text === 'type' &&
          ts.isStringLiteral(el.value) &&
          el.value.text === 'macro',
      )
    ) {
      const name = node.importClause?.name?.text
      if (name) names.push(name)

      if (node.importClause?.namedBindings) {
        const bindings = node.importClause.namedBindings
        if (ts.isNamespaceImport(bindings)) {
          names.push(bindings.name.text)
        } else {
          for (const el of bindings.elements) names.push(el.name.text)
        }
      }
    }
  })

  return names
}
