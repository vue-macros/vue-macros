import {
  createFilter,
  DEFINE_PROP,
  DEFINE_PROP_DOLLAR,
} from '@vue-macros/common'
import { addProps, getText, type VueMacrosPlugin } from './common'
import type { Code, Sfc } from '@vue/language-core'

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
  edition,
}: {
  codes: Code[]
  defineProps: DefineProp[]
  vueLibName: string
  edition: 'kevinEdition' | 'johnsonEdition'
}) {
  addProps(
    codes,
    defineProps.map((defineProp) => {
      let result = defineProp.name ?? 'modelValue'

      if (!defineProp.required) {
        result += '?'
      }
      result += ': '

      let type = 'any'
      if (defineProp.type) {
        type = defineProp.type
      } else if (defineProp.defaultValue && defineProp.prop) {
        type = `NonNullable<typeof ${defineProp.prop}${defineProp.isReactivityTransform ? '' : `['value']`}>`
      }
      result += type
      return result
    }),
    vueLibName,
  )

  if (edition === 'kevinEdition') {
    codes.push(`
declare function $defineProp<T>(
  name: string,
  options: 
    | ({ default: T } & __VLS_PropOptions<T>)
    | ({ required: true } & __VLS_PropOptions<T>)
): T;
declare function $defineProp<T>(
  name?: string,
  options?: __VLS_PropOptions<T>
): T | undefined;
`)
  } else if (edition === 'johnsonEdition') {
    codes.push(`
type __VLS_Widen<T> = T extends number | string | boolean | symbol
  ? ReturnType<T['valueOf']>
  : T;
type __VLS_PropOptions<T> = Omit<
  Omit<
    Exclude<import('${vueLibName}').Prop<T>, import('${vueLibName}').PropType<T>>, 
    'default'
  >,
  'required'
>;
declare function $defineProp<T>(
  value: T | (() => T) | undefined,
  required: true,
  options?: __VLS_PropOptions<T>
): __VLS_Widen<T>;
declare function $defineProp<T>(
  value: T | (() => T),
  required?: boolean,
  options?: __VLS_PropOptions<T>
): __VLS_Widen<T>;
declare function $defineProp<T>(
  value?: T | (() => T),
  required?: boolean,
  options?: __VLS_PropOptions<T>
): | __VLS_Widen<T>
   | undefined;
`)
  }
}

function getDefineProp(
  ts: typeof import('typescript'),
  sfc: Sfc,
  edition: 'kevinEdition' | 'johnsonEdition',
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
      if (edition === 'kevinEdition') {
        const type = node.typeArguments?.length
          ? getText(node.typeArguments[0], { ts, sfc })
          : undefined
        const name =
          node.arguments[0] && ts.isStringLiteral(node.arguments[0])
            ? node.arguments[0].text
            : ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)
              ? getText(parent.name, { ts, sfc })
              : undefined
        const prop =
          ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)
            ? getText(parent.name, { ts, sfc })
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
                getText(property.name, { ts, sfc }) === 'required' &&
                property.initializer.kind === ts.SyntaxKind.TrueKeyword
              )
                required = true

              if (
                ts.isIdentifier(property.name) &&
                getText(property.name, { ts, sfc }) === 'default'
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
        edition === 'johnsonEdition' &&
        ts.isVariableDeclaration(parent)
      ) {
        const name = ts.isIdentifier(parent.name)
          ? getText(parent.name, { ts, sfc })
          : undefined
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

const plugin: VueMacrosPlugin<'defineProp'> = (ctx, options = {}) => {
  if (!options) return []

  const filter = createFilter(options)
  const {
    modules: { typescript: ts },
    vueCompilerOptions: { experimentalDefinePropProposal, lib },
  } = ctx

  return {
    name: 'vue-macros-define-prop',
    version: 2.1,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (
        !filter(fileName) ||
        !['ts', 'tsx'].includes(embeddedFile.lang) ||
        !sfc.scriptSetup?.ast
      )
        return

      const edition =
        options.edition || experimentalDefinePropProposal || 'kevinEdition'
      const defineProps = getDefineProp(ts, sfc, edition)
      if (defineProps.length === 0) return

      transformDefineProp({
        codes: embeddedFile.content,
        defineProps,
        vueLibName: lib,
        edition,
      })
    },
  }
}
export default plugin
export { plugin as 'module.exports' }
