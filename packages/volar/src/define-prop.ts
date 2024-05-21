import { DEFINE_PROP, DEFINE_PROP_DOLLAR } from '@vue-macros/common'
import {
  type Code,
  type Sfc,
  type VueCompilerOptions,
  type VueLanguagePlugin,
  replace,
} from '@vue/language-core'
import { addProps, getText } from './common'

interface DefineProp {
  name?: string
  prop?: string
  type?: string
  defaultValue?: string
  required: boolean
  isReactivityTransform: boolean
}

function transformDefineProp({
  codes,
  defineProps,
  vueLibName,
  vueCompilerOptions,
}: {
  codes: Code[]
  defineProps: DefineProp[]
  vueLibName: string
  vueCompilerOptions: VueCompilerOptions
}) {
  replace(
    codes,
    /(?<=type __VLS_PublicProps = )/,
    '{\n',
    ...defineProps.flatMap((defineProp) => {
      const result = [defineProp.name ?? 'modelValue']

      if (!defineProp.required) {
        result.push('?')
      }
      result.push(': ')

      let type = 'any'
      if (defineProp.type) {
        type = defineProp.type
      } else if (defineProp.defaultValue && defineProp.prop) {
        type = `NonNullable<typeof ${defineProp.prop}${defineProp.isReactivityTransform ? '' : `['value']`}>`
      }

      result.push(type, `,\n`)
      return result
    }),
    '} & ',
  )
  addProps(codes, ['__VLS_TypePropsToOption<__VLS_PublicProps>'], vueLibName)

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
): T
declare function $defineProp<T>(
  name?: string,
  options?: __VLS_PropOptions<T>
): T | undefined`)
  } else if (
    vueCompilerOptions.experimentalDefinePropProposal === 'johnsonEdition'
  ) {
    codes.push(`
type __VLS_Widen<T> = T extends number | string | boolean | symbol
  ? ReturnType<T['valueOf']>
  : T
type __VLS_PropOptions<T> = Omit<
  Omit<
    Exclude<import('${vueLibName}').Prop<T>, import('${vueLibName}').PropType<T>>, 
    'default'
  >,
  'required'
>
declare function $defineProp<T>(
  value: T | (() => T) | undefined,
  required: true,
  options?: __VLS_PropOptions<T>
): __VLS_Widen<T>
declare function $defineProp<T>(
  value: T | (() => T),
  required?: boolean,
  options?: __VLS_PropOptions<T>
): __VLS_Widen<T>
declare function $defineProp<T>(
  value?: T | (() => T),
  required?: boolean,
  options?: __VLS_PropOptions<T>
): | __VLS_Widen<T>
   | undefined
`)
  }
}

function getDefineProp(
  ts: typeof import('typescript'),
  sfc: Sfc,
  vueCompilerOptions: VueCompilerOptions,
) {
  const defineProps: DefineProp[] = []
  function visitNode(
    node: import('typescript').Node,
    parent: import('typescript').Node,
    isReactivityTransform = false,
  ) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      [DEFINE_PROP, DEFINE_PROP_DOLLAR].includes(node.expression.escapedText!)
    ) {
      if (
        vueCompilerOptions.experimentalDefinePropProposal === 'kevinEdition'
      ) {
        const type = node.typeArguments?.length
          ? getText(node.typeArguments[0], { ts, sfc })
          : undefined
        const name =
          node.arguments[0] && ts.isStringLiteral(node.arguments[0])
            ? node.arguments[0].text
            : ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)
              ? parent.name.text
              : undefined
        const prop =
          ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)
            ? parent.name.text
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
                property.name.text === 'required' &&
                property.initializer.kind === ts.SyntaxKind.TrueKeyword
              )
                required = true

              if (
                ts.isIdentifier(property.name) &&
                property.name.text === 'default'
              )
                defaultValue = getText(property.initializer, { ts, sfc })
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
            isReactivityTransform ||
            node.expression.escapedText === DEFINE_PROP_DOLLAR,
        })
      } else if (
        vueCompilerOptions.experimentalDefinePropProposal ===
          'johnsonEdition' &&
        ts.isVariableDeclaration(parent)
      ) {
        const name = ts.isIdentifier(parent.name) ? parent.name.text : undefined
        defineProps.push({
          name,
          prop: name,
          defaultValue:
            node.arguments.length > 0
              ? getText(node.arguments[0], { ts, sfc })
              : undefined,
          type: node.typeArguments?.length
            ? getText(node.typeArguments[0], { ts, sfc })
            : undefined,
          required:
            node.arguments.length >= 2 &&
            node.arguments[1].kind === ts.SyntaxKind.TrueKeyword,
          isReactivityTransform:
            isReactivityTransform ||
            node.expression.escapedText === DEFINE_PROP_DOLLAR,
        })
      }
    }
  }

  const ast = sfc.scriptSetup!.ast
  ts.forEachChild(ast, (node) => {
    if (ts.isExpressionStatement(node)) {
      visitNode(node.expression, ast)
    } else if (ts.isVariableStatement(node)) {
      ts.forEachChild(node.declarationList, (decl) => {
        if (!ts.isVariableDeclaration(decl) || !decl.initializer) return
        if (
          ts.isCallExpression(decl.initializer) &&
          ts.isIdentifier(decl.initializer.expression) &&
          decl.initializer.expression.escapedText === '$' &&
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
    version: 2,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (
        !['ts', 'tsx'].includes(embeddedFile.lang) ||
        !sfc.scriptSetup ||
        !sfc.scriptSetup.ast
      )
        return

      const defineProps = getDefineProp(ts, sfc, vueCompilerOptions)
      if (defineProps.length === 0) return

      const vueLibName = vueCompilerOptions.lib

      transformDefineProp({
        codes: embeddedFile.content,
        defineProps,
        vueLibName,
        vueCompilerOptions,
      })
    },
  }
}
export default plugin
