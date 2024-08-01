import { resolveOptions, type OptionsResolved } from '@vue-macros/config'
import { replace, replaceAll } from 'muggle-string'
import type { SFCScriptBlock } from '@vue-macros/common'
import type { Code, Sfc, VueLanguagePlugin } from '@vue/language-core'

export const REGEX_DEFINE_COMPONENT: RegExp =
  /(?<=(?:__VLS_|\(await import\(\S+\)\)\.)defineComponent\(\{\n)/g

export function addProps(codes: Code[], decl: Code[], vueLibName: string) {
  if (!decl.length) return

  replace(
    codes,
    /(?<=type __VLS_PublicProps = )/,
    `{\n${decl.join(',\n')}\n} & `,
  )

  if (codes.includes('__VLS_TypePropsToOption<')) return

  replaceAll(
    codes,
    REGEX_DEFINE_COMPONENT,
    '  props: ({} as __VLS_TypePropsToOption<__VLS_PublicProps>),\n',
  )
  codes.push(
    `type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;\n`,
    `type __VLS_TypePropsToOption<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? { type: import('${vueLibName}').PropType<__VLS_NonUndefinedable<T[K]>> } : { type: import('${vueLibName}').PropType<T[K]>, required: true } };\n`,
  )
  return true
}

export function addEmits(codes: Code[], decl: Code[], vueLibName: string) {
  if (!decl.length) return

  const index = codes.findIndex((code) =>
    code.toString().startsWith('type __VLS_ModelEmitsType = '),
  )
  if (codes[index + 1] === '{}') {
    codes[index + 1] =
      ` typeof __VLS_modelEmitsType; const __VLS_modelEmitsType = (await import('${vueLibName}')).defineEmits<{\n${decl.join(',\n')}\n}>()`
  } else {
    codes.splice(index + 4, 0, `${decl.join(',\n')}\n`)
  }

  if (
    codes.some((code) => code.includes('emits: ({} as __VLS_NormalizeEmits<'))
  )
    return

  replaceAll(
    codes,
    REGEX_DEFINE_COMPONENT,
    'emits: ({} as __VLS_NormalizeEmits<__VLS_ModelEmitsType>),\n',
  )
  return true
}

export function addCode(codes: Code[], ...args: Code[]): void {
  const index = codes.findIndex((code) =>
    code.includes('__VLS_setup = (async () => {'),
  )
  codes.splice(index > -1 ? index + 1 : codes.length, 0, ...args)
}

export type PluginContext = Parameters<VueLanguagePlugin>[0]

const resolvedOptions: Map<string, OptionsResolved> = new Map()

export function getVolarOptions<K extends keyof OptionsResolved>(
  context: PluginContext,
  key: K,
): OptionsResolved[K] {
  const root = context.compilerOptions.pathsBasePath as string

  let resolved: OptionsResolved | undefined
  if (!resolvedOptions.has(root)) {
    resolved = resolveOptions(context.vueCompilerOptions.vueMacros, root)
    resolvedOptions.set(root, resolved)
  }

  return (resolved || resolvedOptions.get(root)!)[key]
}

export function getImportNames(
  ts: typeof import('typescript'),
  sfc: Sfc,
): string[] {
  const names: string[] = []
  const sourceFile = sfc.scriptSetup!.ast
  ts.forEachChild(sourceFile, (node) => {
    if (
      ts.isImportDeclaration(node) &&
      node.attributes?.elements.some(
        (el) =>
          getText(el.name, { ts, sfc, source: 'scriptSetup' }) === 'type' &&
          ts.isStringLiteral(el.value) &&
          getText(el.value, { ts, sfc, source: 'scriptSetup' }) === 'macro',
      )
    ) {
      const name = node.importClause?.name?.escapedText
      if (name) names.push(name)

      if (node.importClause?.namedBindings) {
        const bindings = node.importClause.namedBindings
        if (ts.isNamespaceImport(bindings)) {
          names.push(bindings.name.escapedText!)
        } else {
          for (const el of bindings.elements) names.push(el.name.escapedText!)
        }
      }
    }
  })

  return names
}

export interface VolarContext {
  sfc: Sfc
  ts: typeof import('typescript')
  source?: 'script' | 'scriptSetup'
}

export function getStart(
  node: import('typescript').Node,
  { ts, sfc, source = 'scriptSetup' }: VolarContext,
): number {
  return (ts as any).getTokenPosOfNode(node, sfc[source]!.ast)
}

export function getText(
  node: import('typescript').Node,
  context: VolarContext,
): string {
  const { sfc, source = 'scriptSetup' } = context
  return sfc[source]!.content.slice(getStart(node, context), node.end)
}

export function isJsxExpression(
  node?: import('typescript').Node,
): node is import('typescript').JsxExpression {
  return node?.kind === 294
}

export function patchSFC(block: SFCScriptBlock | null, offset: number): void {
  if (block) {
    block.loc.start.column -= offset
    block.loc.start.offset -= offset
    block.loc.end.offset -= offset
    if (block.loc.end.line === block.loc.start.line) {
      block.loc.end.column -= offset
    }
  }
}
