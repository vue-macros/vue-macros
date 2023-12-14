import { DEFINE_MODELS, DEFINE_MODELS_DOLLAR } from '@vue-macros/common'
import {
  FileKind,
  FileRangeCapabilities,
  type Segment,
  type Sfc,
  type VueLanguagePlugin,
} from '@vue/language-core'
import {
  addEmits,
  addProps,
  getVolarOptions,
  getVueLibraryName,
} from './common'

function transformDefineModels({
  codes,
  sfc,
  typeArg,
  vueLibName,
  unified,
}: {
  codes: Segment<FileRangeCapabilities>[]
  sfc: Sfc
  typeArg: import('typescript/lib/tsserverlibrary').TypeNode
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
  mergeProps() ||
    addProps(
      codes,
      ['__VLS_TypePropsToRuntimeProps<__VLS_ModelToProps<', seg, '>>'],
      vueLibName,
    )
  mergeEmits() || addEmits(codes, ['__VLS_ModelToEmits<', seg, '>'])

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
    type __VLS_ModelToEmits<T> = T extends Record<string | number, any> ? { [K in keyof T & (string | number) as __VLS_GetEventKey<K>]: (value: T[K]) => void } : T;`,
  )

  function mergeProps() {
    const indexes = codes.reduce((res: number[], code, index) => {
      if (code === '__VLS_TypePropsToRuntimeProps<') res.unshift(index)
      return res
    }, [])
    if (indexes.length === 0) return false

    for (const idx of indexes)
      codes.splice(idx + 2, 0, ' & __VLS_ModelToProps<', seg, '>')
    return true
  }

  function mergeEmits() {
    const indexes = codes.reduce((res: number[], code, index) => {
      if (code === 'emits: ({} as __VLS_NormalizeEmits<typeof ')
        res.unshift(index)
      return res
    }, [])
    if (indexes.length === 0) return false

    for (const idx of indexes)
      codes.splice(idx + 2, 1, ' & __VLS_ModelToEmits<', seg, '>>),\n')
    return true
  }
}

function getTypeArg(
  ts: typeof import('typescript/lib/tsserverlibrary'),
  sfc: Sfc,
) {
  function getCallArg(node: import('typescript/lib/tsserverlibrary').Node) {
    if (
      !(
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        [DEFINE_MODELS, DEFINE_MODELS_DOLLAR].includes(node.expression.text) &&
        node.typeArguments?.length === 1
      )
    )
      return undefined
    return node.typeArguments[0]
  }

  const sourceFile = sfc.scriptSetup!.ast
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

const plugin: VueLanguagePlugin = ({
  modules: { typescript: ts },
  vueCompilerOptions,
}) => {
  return {
    name: 'vue-macros-define-models',
    version: 1,
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      if (
        embeddedFile.kind !== FileKind.TypeScriptHostFile ||
        !sfc.scriptSetup ||
        !sfc.scriptSetup.ast
      )
        return

      const typeArg = getTypeArg(ts, sfc)
      if (!typeArg) return

      const vueVersion = vueCompilerOptions.target
      const vueLibName = getVueLibraryName(vueVersion)
      const volarOptions = getVolarOptions(vueCompilerOptions)
      const unified =
        vueVersion < 3 && (volarOptions?.defineModels?.unified ?? true)

      transformDefineModels({
        codes: embeddedFile.content,
        sfc,
        typeArg,
        vueLibName,
        unified,
      })
    },
  }
}
export default plugin
