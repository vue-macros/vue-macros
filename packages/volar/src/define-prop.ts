import { DEFINE_PROP, DEFINE_PROP_DOLLAR } from '@vue-macros/common'
import { FileKind, type FileRangeCapabilities } from '@volar/language-core'
import {
  type Segment,
  type Sfc,
  type VueCompilerOptions,
  type VueLanguagePlugin,
  replace,
} from '@vue/language-core'
import { getVueLibraryName } from './common'

interface TextRange {
  start: number
  end: number
}

interface DefineProp {
  name: TextRange | undefined
  prop: TextRange | undefined
  type: TextRange | undefined
  defaultValue: TextRange | undefined
  required: boolean
  isReactivityTransform: boolean
}

function transform({
  codes,
  sfc,
  defineProps,
  vueLibName,
  vueCompilerOptions,
}: {
  codes: Segment<FileRangeCapabilities>[]
  sfc: Sfc
  defineProps: DefineProp[]
  vueLibName: string
  vueCompilerOptions: VueCompilerOptions
}) {
  replace(codes, /(?<!},)(?=\nsetup\(\) {)/, '\nprops: {\n},')
  replace(
    codes,
    /(?=},\nsetup\(\) {)/,
    '...({} as {\n',
    ...defineProps.flatMap((defineProp) => {
      let propName = 'modelValue'
      const result: string[] = []

      if (defineProp.name) {
        propName = sfc.scriptSetup!.content.slice(
          defineProp.name.start,
          defineProp.name.end
        )
      }
      result.push(propName, `: `)

      let type = 'any'
      if (defineProp.type) {
        type = sfc.scriptSetup!.content.slice(
          defineProp.type.start,
          defineProp.type.end
        )
      } else if (defineProp.defaultValue && defineProp.prop) {
        type = `NonNullable<typeof ${sfc.scriptSetup!.content.slice(
          defineProp.prop.start,
          defineProp.prop.end
        )}${defineProp.isReactivityTransform ? '' : `['value']`}>`
      }

      if (defineProp.required) {
        result.push(
          `{ required: true, type: import('${vueLibName}').PropType<${type}> },\n`
        )
      } else {
        result.push(`import('${vueLibName}').PropType<${type}>,\n`)
      }
      return result
    }),
    '})\n'
  )

  if (vueCompilerOptions.experimentalDefinePropProposal === 'kevinEdition') {
    codes.push(`
type __VLS_PropOptions<T> = Exclude<
  import('${vueLibName}').Prop<T>,
  import('${vueLibName}').PropType<T>
>
declare function $defineProp<T>(
  name: string,
  options: 
    | ({ default: T } & __VLS_PropOptions<T>)
    | ({ required: true } & __VLS_PropOptions<T>)
): import('unplugin-vue-macros/macros').ComputedRefValue<T>
declare function $defineProp<T>(
  name?: string,
  options?: __VLS_PropOptions<T>
): import('unplugin-vue-macros/macros').ComputedRefValue<T | undefined>`)
  }
  if (vueCompilerOptions.experimentalDefinePropProposal === 'johnsonEdition') {
    codes.push(`
type __VLS_Widen<T> = T extends number | string | boolean | symbol
  ? ReturnType<T['valueOf']>
  : T
type __VLS_PropOptions<T> = Exclude<
  import('${vueLibName}').Prop<__VLS_Widen<T>>,
  import('${vueLibName}').PropType<__VLS_Widen<T>>
>
declare function $defineProp<T>(
  value: T | (() => T) | undefined,
  required: true,
  options?: __VLS_PropOptions<T>
): import('unplugin-vue-macros/macros').ComputedRefValue<__VLS_Widen<T>>
declare function $defineProp<T>(
  value: T | (() => T),
  required?: boolean,
  options?: __VLS_PropOptions<T>
): import('unplugin-vue-macros/macros').ComputedRefValue<__VLS_Widen<T>>
declare function $defineProp<T>(
  value?: T | (() => T),
  required?: boolean,
  options?: __VLS_PropOptions<T>
): import('unplugin-vue-macros/macros').ComputedRefValue<
  | __VLS_Widen<T>
  | undefined
>`)
  }
}

function getDefineProps(
  ts: typeof import('typescript/lib/tsserverlibrary'),
  sfc: Sfc,
  vueCompilerOptions: VueCompilerOptions
) {
  const ast = sfc.scriptSetupAst!
  function _getStartEnd(node: import('typescript/lib/tsserverlibrary').Node) {
    return {
      start: node.getStart(ast),
      end: node.getEnd(),
    }
  }

  const defineProps: DefineProp[] = []
  function visitNode(
    node: import('typescript/lib/tsserverlibrary').Node,
    parent: import('typescript/lib/tsserverlibrary').Node,
    isReactivityTransform = false
  ) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      [DEFINE_PROP, DEFINE_PROP_DOLLAR].includes(node.expression.getText(ast))
    ) {
      if (
        vueCompilerOptions.experimentalDefinePropProposal === 'kevinEdition'
      ) {
        const type = node.typeArguments?.length
          ? _getStartEnd(node.typeArguments[0])
          : undefined
        const name =
          node.arguments[0] && ts.isStringLiteral(node.arguments[0])
            ? _getStartEnd(node.arguments[0])
            : ts.isVariableDeclaration(parent)
            ? _getStartEnd(parent.name)
            : undefined
        const prop = ts.isVariableDeclaration(parent)
          ? _getStartEnd(parent.name)
          : undefined
        const optionArg =
          node.arguments[0] && ts.isObjectLiteralExpression(node.arguments[0])
            ? node.arguments[0]
            : node.arguments[1] &&
              ts.isObjectLiteralExpression(node.arguments[1])
            ? node.arguments[1]
            : undefined

        let required = false
        let defaultValue
        if (optionArg) {
          for (const property of optionArg.properties) {
            if (
              ts.isPropertyAssignment(property) &&
              ts.isIdentifier(property.name)
            ) {
              if (
                property.name.getText(sfc.scriptSetupAst) === 'required' &&
                property.initializer.kind === ts.SyntaxKind.TrueKeyword
              )
                required = true

              if (property.name.getText(sfc.scriptSetupAst) === 'default')
                defaultValue = _getStartEnd(property.initializer)
            }
          }
        }

        defineProps.push({
          name,
          prop,
          type,
          defaultValue,
          required,
          isReactivityTransform:
            node.expression.getText(ast) === DEFINE_PROP_DOLLAR ||
            isReactivityTransform,
        })
      } else if (
        vueCompilerOptions.experimentalDefinePropProposal ===
          'johnsonEdition' &&
        ts.isVariableDeclaration(parent)
      ) {
        defineProps.push({
          name: _getStartEnd(parent.name),
          prop: _getStartEnd(parent.name),
          defaultValue:
            node.arguments.length > 0
              ? _getStartEnd(node.arguments[0])
              : undefined,
          type: node.typeArguments?.length
            ? _getStartEnd(node.typeArguments[0])
            : undefined,
          required:
            node.arguments.length >= 2 &&
            node.arguments[1].kind === ts.SyntaxKind.TrueKeyword,
          isReactivityTransform:
            node.expression.getText(ast) === DEFINE_PROP_DOLLAR ||
            isReactivityTransform,
        })
      }
    }
  }

  ast.forEachChild((node) => {
    if (ts.isExpressionStatement(node)) {
      visitNode(node.expression, ast)
    } else if (ts.isVariableStatement(node)) {
      node.declarationList.forEachChild((decl) => {
        if (!ts.isVariableDeclaration(decl) || !decl.initializer) return
        if (
          ts.isCallExpression(decl.initializer) &&
          decl.initializer.expression.getText(ast) === '$' &&
          decl.initializer.arguments.length > 0
        ) {
          visitNode(decl.initializer.arguments[0], decl, true)
        } else {
          visitNode(decl.initializer, decl)
        }
      })
    }
  })

  return defineProps
}

const plugin: VueLanguagePlugin = ({
  modules: { typescript: ts },
  vueCompilerOptions,
}) => {
  return {
    name: 'vue-macros-define-prop',
    version: 1,
    resolveEmbeddedFile(fileName, sfc, embeddedFile) {
      if (
        embeddedFile.kind !== FileKind.TypeScriptHostFile ||
        !sfc.scriptSetup ||
        !sfc.scriptSetupAst
      )
        return

      const defineProps = getDefineProps(ts, sfc, vueCompilerOptions)
      if (defineProps.length === 0) return

      const vueVersion = vueCompilerOptions.target
      const vueLibName = getVueLibraryName(vueVersion)

      transform({
        codes: embeddedFile.content,
        sfc,
        defineProps,
        vueLibName,
        vueCompilerOptions,
      })
    },
  }
}
export default plugin
