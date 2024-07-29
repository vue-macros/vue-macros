import { replace, replaceAll } from 'muggle-string'
import type { VolarOptions } from '..'
import type { Code, Sfc } from '@vue/language-core'

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

export function getVolarOptions<K extends keyof VolarOptions>(
  vueMacros: VolarOptions | undefined,
  key: K,
  defaultEnabled = true,
): Exclude<VolarOptions[K], boolean> | undefined {
  const options = vueMacros?.[key] ?? defaultEnabled
  if (options) {
    return options === true ? ({} as any) : options
  }
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

interface Options {
  sfc: Sfc
  ts: typeof import('typescript')
  source?: 'script' | 'scriptSetup'
}

export function getStart(
  node: import('typescript').Node,
  { ts, sfc, source = 'scriptSetup' }: Options,
): number {
  return (ts as any).getTokenPosOfNode(node, sfc[source]!.ast)
}

export function getText(
  node: import('typescript').Node,
  options: Options,
): string {
  const { sfc, source = 'scriptSetup' } = options
  return sfc[source]!.content.slice(getStart(node, options), node.end)
}

export function isJsxExpression(
  node?: import('typescript').Node,
): node is import('typescript').JsxExpression {
  return node?.kind === 294
}
