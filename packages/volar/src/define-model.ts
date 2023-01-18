import { DEFINE_MODEL, DEFINE_MODEL_DOLLAR } from '@vue-macros/common'
import { FileKind, FileRangeCapabilities } from '@volar/language-core'
import { getVueLibraryName } from './common'
import type { FileCapabilities } from '@volar/language-core'
import type { Segment } from 'muggle-string'
import type {
  Sfc,
  VueCompilerOptions,
  VueEmbeddedFile,
  VueLanguagePlugin,
} from '@volar/vue-language-core'

function transformDefineModel({
  codes,
  sfc,
  typeArg,
  vueLibName,
  unified,
}: {
  codes: Segment<FileRangeCapabilities>[]
  sfc: Sfc
  typeArg: ts.TypeNode
  vueLibName: string
  unified: boolean
}) {
  const source = sfc.scriptSetup!.content.slice(typeArg.pos, typeArg.end)
  const seg: Segment<FileRangeCapabilities> = [
    source,
    'scriptSetup',
    typeArg!.pos,
    FileRangeCapabilities.full,
  ]
  mergeProps() || addProps()
  mergeEmits() || addEmits()

  codes.push(
    `type __VLS_GetPropKey<K> = K extends 'modelValue'${
      unified ? '' : ' & never'
    } ? 'value' : K
    type __VLS_ModelToProps<T> = {
      [K in keyof T as __VLS_GetPropKey<K>]: T[K]
    }
    type __VLS_GetEventKey<K extends string | number> = K extends 'modelValue'${
      unified ? '' : ' & never'
    } ? 'input' : \`update:\${K}\`
    type __VLS_ModelToEmits<T> = T extends Record<string | number, any> ? { [K in keyof T & (string | number) as __VLS_GetEventKey<K>]: (value: T[K]) => void } : T`
  )

  function mergeProps() {
    const idx = codes.indexOf('__VLS_TypePropsToRuntimeProps<')
    if (idx === -1) return false

    codes.splice(idx + 2, 0, ' & __VLS_ModelToProps<', seg, '>')
    return true
  }

  function addProps() {
    const idx = codes.indexOf('setup() {\n')
    if (idx === -1) return false
    const segs: Segment<FileRangeCapabilities>[] = [
      'props: ({} as __VLS_TypePropsToRuntimeProps<__VLS_ModelToProps<',
      seg,
      '>>),\n',
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
    return true
  }

  function addEmits() {
    const idx = codes.indexOf('setup() {\n')
    if (idx === -1) return false

    const segs: Segment<FileCapabilities>[] = [
      'emits: ({} as __VLS_ModelToEmits<',
      seg,
      '>),\n',
    ]
    codes.splice(idx, 0, ...segs)
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
        [DEFINE_MODEL, DEFINE_MODEL_DOLLAR].includes(node.expression.text) &&
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
  vueCompilerOptions: VueCompilerOptions
  sfc: Sfc
  embeddedFile: VueEmbeddedFile
}) {
  if (
    embeddedFile.kind !== FileKind.TypeScriptHostFile ||
    !sfc.scriptSetup ||
    !sfc.scriptSetupAst
  )
    return

  const typeArg = getTypeArg(ts, sfc)
  if (!typeArg) return

  const vueVersion = vueCompilerOptions.target ?? 3
  const vueLibName = getVueLibraryName(vueVersion)
  const unified =
    (vueVersion < 3 && (vueCompilerOptions as any)?.defineModel?.unified) ??
    true

  transformDefineModel({
    codes: embeddedFile.content,
    sfc,
    typeArg,
    vueLibName,
    unified,
  })
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
