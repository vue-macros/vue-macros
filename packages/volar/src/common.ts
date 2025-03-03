import path from 'node:path'
import process from 'node:process'
import {
  resolveOptions,
  type FeatureName,
  type OptionsResolved,
} from '@vue-macros/config'
import { replace, replaceAll } from 'muggle-string'
import type { SFCScriptBlock } from '@vue-macros/common'
import type { Code, Sfc, VueLanguagePlugin } from '@vue/language-core'

export const REGEX_DEFINE_COMPONENT: RegExp =
  /(?<=(?:__VLS_|\(await import\(\S+\)\)\.)defineComponent\(\{\n)/g

export function addProps(
  codes: Code[],
  decl: Code[],
  vueLibName: string,
): true | undefined {
  const codeString = codes.toString()
  if (!decl.length || codeString.includes('{} as __VLS_TypePropsToOption<'))
    return

  replace(
    codes,
    /(?<=type __VLS_PublicProps = )/,
    `{\n${decl.join(',\n')}\n} & `,
  )

  replaceAll(
    codes,
    REGEX_DEFINE_COMPONENT,
    'props: {} as __VLS_TypePropsToOption<__VLS_PublicProps>,\n',
  )
  if (!codeString.includes('type __VLS_NonUndefinedable')) {
    codes.push(
      `type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;\n`,
      `type __VLS_TypePropsToOption<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? { type: import('${vueLibName}').PropType<__VLS_NonUndefinedable<T[K]>> } : { type: import('${vueLibName}').PropType<T[K]>, required: true } };\n`,
    )
  }
  return true
}

export function addEmits(
  codes: Code[],
  decl: Code[],
  vueLibName: string,
): true | undefined {
  if (!decl.length || codes.toString().includes('{} as __VLS_NormalizeEmits<'))
    return

  let index = codes.findIndex((code) =>
    code.toString().startsWith('const __VLS_modelEmitsType = '),
  )
  if (index < 0) {
    index = codes.findIndex((code) =>
      code.toString().includes('type __VLS_PublicProps = '),
    )
    codes.splice(
      index,
      0,
      `const __VLS_modelEmitsType = (await import('${vueLibName}')).defineEmits<{\n${decl.join(',\n')}\n}>();\n`,
      `type __VLS_ModelEmitsType = typeof __VLS_modelEmitsType;\n`,
    )
  } else {
    codes.splice(index + 4, 0, `${decl.join(',\n')}\n`)
  }

  replaceAll(
    codes,
    REGEX_DEFINE_COMPONENT,
    'emits: {} as __VLS_NormalizeEmits<__VLS_ModelEmitsType>,\n',
  )
  return true
}

export function addCode(codes: Code[], ...args: Code[]): void {
  const index = codes.findIndex((code) =>
    code.includes('__VLS_setup = (async () => {'),
  )
  codes.splice(index !== -1 ? index + 1 : codes.length, 0, ...args)
}

export type VueMacrosPlugin<K extends FeatureName> = (
  ctx: PluginContext,
  options?: OptionsResolved[K],
) => ReturnType<VueLanguagePlugin>

export type PluginContext = Parameters<VueLanguagePlugin>[0]

const resolvedOptions: Map<string, OptionsResolved> = new Map()

export function getVolarOptions<K extends keyof OptionsResolved>(
  context: PluginContext,
  key: K,
): OptionsResolved[K] {
  const configPath = context.compilerOptions.configFilePath
  const root =
    typeof configPath === 'string' ? path.dirname(configPath) : process.cwd()
  let resolved: OptionsResolved | undefined
  if (!resolvedOptions.has(root)) {
    resolved = resolveOptions.sync(context.vueCompilerOptions.vueMacros, root)
    resolvedOptions.set(root, resolved)
  }

  return (resolved || resolvedOptions.get(root)!)[key]
}

export interface VolarContext {
  ts: typeof import('typescript')
  ast?: import('typescript').SourceFile
  sfc?: Sfc
  source?: 'script' | 'scriptSetup'
}

export function getStart(
  node:
    | import('typescript').Node
    | import('typescript').NodeArray<import('typescript').Node>,
  { ts, ast, sfc, source = 'scriptSetup' }: VolarContext,
): number {
  ast = ast || sfc?.[source]?.ast
  return (ts as any).getTokenPosOfNode(node, ast)
}

export function getText(
  node: import('typescript').Node,
  context: VolarContext,
): string {
  let { sfc, ast, source = 'scriptSetup' } = context
  ast = ast || sfc?.[source]?.ast
  return ast!.text.slice(getStart(node, context), node.end)
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
