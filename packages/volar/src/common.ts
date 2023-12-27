import {
  type FileRangeCapabilities,
  type Segment,
  type Sfc,
  type VueCompilerOptions,
  getSlotsPropertyName,
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

export function getPropsType(codes: Segment<FileRangeCapabilities>[]) {
  if (codes.toString().includes('type __VLS_getProps')) return

  codes.push(`
type __VLS_getProps<T> = T extends new () => { $props: infer P }
  ? NonNullable<P>
  : T extends (props: infer P, ctx: any) => any
    ? NonNullable<P>
    : {};`)
}

export function getEmitsType(codes: Segment<FileRangeCapabilities>[]) {
  if (codes.toString().includes('type __VLS_getEmits')) return

  codes.push(`
type __VLS_getEmits<T> = T extends new () => { $emit: infer E }
  ? NonNullable<__VLS_NormalizeEmits<E>>
  : T extends (
        props: any,
        ctx: { slots: any; attrs: any; emit: infer E },
      ) => any
    ? NonNullable<__VLS_NormalizeEmits<E>>
    : {};`)
}

export function getModelsType(codes: Segment<FileRangeCapabilities>[]) {
  if (codes.toString().includes('type __VLS_getModels')) return
  getEmitsType(codes)
  getPropsType(codes)

  codes.push(`
type __VLS_CamelCase<S extends string> = S extends \`\${infer F}-\${infer RF}\${infer R}\`
  ? \`\${F}\${Uppercase<RF>}\${__VLS_CamelCase<R>}\`
  : S;
type __VLS_RemoveUpdatePrefix<T> = T extends \`update:modelValue\`
  ? never
  : T extends \`update:\${infer R}\`
    ? __VLS_CamelCase<R>
    : T;
type __VLS_getModels<T> = T extends object
  ? {
      [K in keyof __VLS_getEmits<T> as __VLS_RemoveUpdatePrefix<K>]: __VLS_getProps<T>[__VLS_RemoveUpdatePrefix<K>]
    }
  : {};`)
}

export function getSlotsType(
  codes: Segment<FileRangeCapabilities>[],
  vueVersion?: number,
) {
  if (codes.toString().includes('type __VLS_getSlots')) return
  codes.push(`
type __VLS_getSlots<T> = T extends new () => { '${getSlotsPropertyName(
    vueVersion || 3,
  )}': infer S } ? NonNullable<S>
  : T extends (props: any, ctx: { slots: infer S; attrs: any; emit: any }) => any
  ? NonNullable<S>
  : {};`)
}
