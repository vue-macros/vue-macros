import {
  type Code,
  type Sfc,
  type VueCompilerOptions,
  replaceAll,
} from '@vue/language-core'
import type { VolarOptions } from '..'

export function getVueLibraryName(vueVersion: number) {
  return vueVersion < 2.7 ? '@vue/runtime-dom' : 'vue'
}

export function addProps(content: Code[], decl: Code[]) {
  replaceAll(
    content,
    /setup\(\) {/g,
    'props: ({} as ',
    ...decl,
    '),\n',
    'setup() {',
  )
  return true
}

export function addEmits(content: Code[], decl: Code[]) {
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

export function addCode(codes: Code[], ...args: Code[]) {
  const index = codes.findIndex((code) =>
    code.includes('__VLS_setup = (async () => {'),
  )
  codes.splice(index > -1 ? index + 1 : codes.length, 0, ...args)
}

export function getVolarOptions(
  vueCompilerOptions: VueCompilerOptions,
): VolarOptions | undefined {
  return vueCompilerOptions.vueMacros
}

export function getImportNames(ts: typeof import('typescript'), sfc: Sfc) {
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
) {
  return (ts as any).getTokenPosOfNode(node, sfc[source]!.ast)
}

export function getText(node: import('typescript').Node, options: Options) {
  const { sfc, source = 'scriptSetup' } = options
  return sfc[source]!.content.slice(getStart(node, options), node.end)
}

export function isJsxExpression(
  node?: import('typescript').Node,
): node is import('typescript').JsxExpression {
  return node?.kind === 294
}
