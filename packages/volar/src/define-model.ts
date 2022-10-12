import { EmbeddedFileKind } from '@volar/language-core'
import { getVueLibraryName } from './common'
import type { Segment, SegmentWithData } from 'muggle-string'
import type { PositionCapabilities } from '@volar/language-core'
import type {
  ResolvedVueCompilerOptions,
  Sfc,
  VueEmbeddedFile,
  VueLanguagePlugin,
} from '@volar/vue-language-core'

function transformDefineModel(
  codes: SegmentWithData<PositionCapabilities>[],
  sfc: Sfc,
  typeArg: ts.TypeNode,
  vueLibName: string
) {
  const source = sfc.scriptSetup!.content.slice(typeArg.pos, typeArg.end)
  const seg: Segment<PositionCapabilities> = [
    source,
    'scriptSetup',
    typeArg!.pos,
    { references: true, definition: true, rename: true },
  ]
  mergeProps() || addProps()
  mergeEmits() || addEmits()

  function mergeProps() {
    const idx = codes.indexOf('__VLS_TypePropsToRuntimeProps<')
    if (idx === -1) return false

    codes.splice(idx + 2, 0, ' & ', seg)
    return true
  }

  function addProps() {
    const idx = codes.indexOf('setup() {\n')
    if (idx === -1) return false
    const segs: Segment<PositionCapabilities>[] = [
      'props: (',
      '{} as ',
      '__VLS_TypePropsToRuntimeProps<',
      seg,
      '>',
      '),\n',
    ]
    codes.splice(idx, 0, ...segs)

    codes.push(
      `type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;\n`,
      `type __VLS_TypePropsToRuntimeProps<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? { type: import('${vueLibName}').PropType<__VLS_NonUndefinedable<T[K]>> } : { type: import('${vueLibName}').PropType<T[K]>, required: true } };\n`
    )
    return true
  }

  function mergeEmits() {
    const idx = codes.indexOf(
      'emits: ({} as __VLS_UnionToIntersection<__VLS_ConstructorOverloads<'
    )
    if (idx === -1) return false

    codes.splice(idx + 2, 1, '>> & __VLS_ModelToEmits<', seg, '>),\n')
    codes.push(
      `type __VLS_ModelToEmits<T> = T extends Record<string | number, any> ? { [K in keyof T & (string | number) as \`update:\${K}\`]: (value: T[K]) => void } : T`
    )
    return true
  }

  function addEmits() {
    const idx = codes.indexOf('setup() {\n')
    if (idx === -1) return false

    const segs: Segment<PositionCapabilities>[] = [
      'emits: ({} as __VLS_ModelToEmits<',
      seg,
      '>),\n',
    ]
    codes.splice(idx, 0, ...segs)
    codes.push(
      `type __VLS_ModelToEmits<T> = T extends Record<string | number, any> ? { [K in keyof T & (string | number) as \`update:\${K}\`]: (value: T[K]) => void } : T`
    )
    return true
  }
}

function getTypeArg(
  ts: typeof import('typescript/lib/tsserverlibrary'),
  sfc: Sfc
) {
  function getCallArg(node: ts.Node) {
    if (
      !(
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'defineModel' &&
        node.typeArguments?.length === 1
      )
    )
      return undefined
    return node.typeArguments[0]
  }

  const sourceFile = sfc.scriptSetupAst!
  return sourceFile.forEachChild((node) => {
    if (ts.isExpressionStatement(node)) {
      return getCallArg(node.expression)
    } else if (ts.isVariableStatement(node)) {
      return node.declarationList.forEachChild((decl) => {
        if (!ts.isVariableDeclaration(decl) || !decl.initializer) return
        return getCallArg(decl.initializer)
      })
    }
  })
}

function resolve({
  ts,
  vueCompilerOptions,
  sfc,
  embeddedFile,
}: {
  ts: typeof import('typescript/lib/tsserverlibrary')
  vueCompilerOptions: ResolvedVueCompilerOptions
  sfc: Sfc
  embeddedFile: VueEmbeddedFile
}) {
  if (
    embeddedFile.kind !== EmbeddedFileKind.TypeScriptHostFile ||
    !sfc.scriptSetup ||
    !sfc.scriptSetupAst
  )
    return

  const typeArg = getTypeArg(ts, sfc)
  if (!typeArg) return

  const vueLibName = getVueLibraryName(vueCompilerOptions.target ?? 3)
  transformDefineModel(embeddedFile.content, sfc, typeArg, vueLibName)
}

const plugin: VueLanguagePlugin = ({
  modules: { typescript: ts },
  vueCompilerOptions,
}) => {
  return {
    name: 'vue-macros-define-model',
    version: 1,
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      resolve({
        ts,
        sfc,
        vueCompilerOptions,
        embeddedFile,
      })
    },
  }
}
export default plugin
