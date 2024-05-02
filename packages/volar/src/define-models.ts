import { DEFINE_MODELS, DEFINE_MODELS_DOLLAR } from '@vue-macros/common'
import {
  type Code,
  type Sfc,
  type VueLanguagePlugin,
  allCodeFeatures,
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
  unified,
}: {
  codes: Code[]
  sfc: Sfc
  typeArg: import('typescript').TypeNode
  vueLibName: string
  unified: boolean
}) {
  const source = sfc.scriptSetup!.content.slice(typeArg.pos, typeArg.end)
  const seg: Code = [source, 'scriptSetup', typeArg!.pos, allCodeFeatures]
  mergeProps() ||
    addProps(codes, ['__VLS_TypePropsToOption<__VLS_ModelToProps<', seg, '>>'])
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
      if (code === '__VLS_TypePropsToOption<') res.unshift(index)
      return res
    }, [])
    if (indexes.length === 0) return false

    for (const idx of indexes)
      codes.splice(
        idx + 2,
        0,
        ' & __VLS_TypePropsToOption<__VLS_ModelToProps<',
        seg,
        '>>',
      )
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

function getTypeArg(ts: typeof import('typescript'), sfc: Sfc) {
  function getCallArg(node: import('typescript').Node) {
    if (
      !(
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        [DEFINE_MODELS, DEFINE_MODELS_DOLLAR].includes(
          node.expression.escapedText!,
        ) &&
        node.typeArguments?.length === 1
      )
    )
      return undefined
    return node.typeArguments[0]
  }

  const sourceFile = sfc.scriptSetup!.ast
  return ts.forEachChild(sourceFile, (node) => {
    if (ts.isExpressionStatement(node)) {
      return getCallArg(node.expression)
    } else if (ts.isVariableStatement(node)) {
      return ts.forEachChild(node.declarationList, (decl) => {
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
    version: 2,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (
        !['ts', 'tsx'].includes(embeddedFile.lang) ||
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
