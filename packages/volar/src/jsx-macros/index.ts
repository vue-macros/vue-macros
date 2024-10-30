import { HELPER_PREFIX } from '@vue-macros/common'
import { toValidAssetId } from '@vue/compiler-dom'
import { replaceSourceRange } from 'muggle-string'
import { getStart, getText } from '../common'
import type { TransformOptions } from '../jsx-directive/index'
import type { VueCompilerOptions } from '@vue/language-core'

export { transformJsxMacros } from './transform'
export { globalTypes } from './global-types'

export type RootMap = Map<
  | import('typescript').ArrowFunction
  | import('typescript').FunctionExpression
  | import('typescript').FunctionDeclaration,
  {
    defineModel?: string[]
    defineSlots?: string
    defineExpose?: string
    defineStyle?: import('typescript').CallExpression[]
    defineComponent?: true
  }
>

function getMacro(
  node: import('typescript').Node | undefined,
  ts: typeof import('typescript'),
  vueCompilerOptions: VueCompilerOptions,
):
  | {
      expression: import('typescript').CallExpression
      initializer: import('typescript').Node
      isRequired: boolean
    }
  | undefined {
  if (!node) return

  if (ts.isVariableStatement(node)) {
    return ts.forEachChild(node.declarationList, (decl) => getExpression(decl))
  } else {
    return getExpression(node)
  }

  function getExpression(decl: import('typescript').Node) {
    if (ts.isVariableDeclaration(decl) && decl.initializer) {
      const initializer =
        ts.isCallExpression(decl.initializer) &&
        ts.isIdentifier(decl.initializer.expression) &&
        decl.initializer.expression.escapedText === '$' &&
        decl.initializer.arguments[0]
          ? decl.initializer.arguments[0]
          : decl.initializer
      const expression = getMacroExpression(initializer)
      if (expression) {
        return {
          expression,
          initializer: decl.initializer,
          isRequired: ts.isNonNullExpression(initializer),
        }
      }
    } else if (ts.isExpressionStatement(decl)) {
      const expression = getMacroExpression(decl.expression)
      if (expression)
        return {
          expression,
          initializer: decl.expression,
          isRequired: ts.isNonNullExpression(decl.expression),
        }
    }
  }

  function getMacroExpression(node: import('typescript').Node) {
    if (ts.isNonNullExpression(node)) {
      node = node.expression
    }
    if (!ts.isCallExpression(node)) return
    const expression = ts.isPropertyAccessExpression(node.expression)
      ? node.expression
      : node
    return (
      ts.isIdentifier(expression.expression) &&
      [
        ...vueCompilerOptions.macros.defineModel,
        ...vueCompilerOptions.macros.defineExpose,
        ...vueCompilerOptions.macros.defineSlots,
        'defineStyle',
      ].includes(expression.expression.escapedText!) &&
      node
    )
  }
}

export function getRootMap(
  options: TransformOptions,
  vueCompilerOptions: VueCompilerOptions,
): RootMap {
  const { ts, sfc, source, codes } = options
  const rootMap: RootMap = new Map()

  function walk(
    node: import('typescript').Node,
    parents: import('typescript').Node[],
  ) {
    ts.forEachChild(node, (child) => {
      parents.unshift(node)
      walk(child, parents)
      parents.shift()
    })

    const root =
      parents[1] &&
      (ts.isArrowFunction(parents[1]) ||
        ts.isFunctionExpression(parents[1]) ||
        ts.isFunctionDeclaration(parents[1]))
        ? parents[1]
        : undefined
    if (!root) return

    if (
      parents[2] &&
      ts.isCallExpression(parents[2]) &&
      !parents[2].typeArguments &&
      getText(parents[2].expression, options) === 'defineComponent'
    ) {
      if (!rootMap.has(root)) rootMap.set(root, {})
      if (!rootMap.get(root)!.defineComponent) {
        rootMap.get(root)!.defineComponent = true
        replaceSourceRange(
          codes,
          source,
          getStart(parents[2], options),
          getStart(parents[2], options),
          HELPER_PREFIX,
        )
      }
    }

    const macro = getMacro(node, ts, vueCompilerOptions)
    if (!macro) return

    const { expression, initializer } = macro
    let isRequired = macro.isRequired
    if (!rootMap.has(root)) rootMap.set(root, {})
    const macroName = getText(expression.expression, options)
    if (vueCompilerOptions.macros.defineModel.includes(macroName)) {
      const modelName =
        expression.arguments[0] &&
        ts.isStringLiteralLike(expression.arguments[0])
          ? expression.arguments[0].text
          : 'modelValue'
      const modelOptions =
        expression.arguments[0] &&
        ts.isStringLiteralLike(expression.arguments[0])
          ? expression.arguments[1]
          : expression.arguments[0]
      if (modelOptions && ts.isObjectLiteralExpression(modelOptions)) {
        let hasRequired = false
        for (const prop of modelOptions.properties) {
          if (
            ts.isPropertyAssignment(prop) &&
            getText(prop.name, options) === 'required'
          ) {
            hasRequired = true
            isRequired = prop.initializer.kind === ts.SyntaxKind.TrueKeyword
          }
        }

        if (!hasRequired && isRequired) {
          replaceSourceRange(
            codes,
            source,
            modelOptions.end - 1,
            modelOptions.end - 1,
            `${expression.arguments.hasTrailingComma ? '' : ','} required: true`,
          )
        }
      } else if (isRequired) {
        replaceSourceRange(
          codes,
          source,
          expression.arguments.end,
          expression.arguments.end,
          `${!expression.arguments.hasTrailingComma && expression.arguments.length ? ',' : ''} { required: true }`,
        )
      }

      const id = toValidAssetId(modelName, `${HELPER_PREFIX}model` as any)
      const typeString = `import("vue").UnwrapRef<typeof ${id}>`
      ;(rootMap.get(root)!.defineModel ??= [])!.push(
        `'${modelName}'${isRequired ? ':' : '?:'} ${typeString}`,
        `'onUpdate:${modelName}'?: ($event: ${typeString}) => any`,
      )
      replaceSourceRange(
        codes,
        source,
        getStart(initializer, options),
        getStart(initializer, options),
        `// @ts-ignore\n${id};\nlet ${id} =`,
      )
    } else if (vueCompilerOptions.macros.defineSlots.includes(macroName)) {
      replaceSourceRange(
        codes,
        source,
        getStart(expression, options),
        getStart(expression, options),
        `// @ts-ignore\n${HELPER_PREFIX}slots;\nconst ${HELPER_PREFIX}slots =`,
      )
      rootMap.get(root)!.defineSlots =
        `{ vSlots?: typeof ${HELPER_PREFIX}slots }`
    } else if (vueCompilerOptions.macros.defineExpose.includes(macroName)) {
      replaceSourceRange(
        codes,
        source,
        getStart(expression, options),
        getStart(expression, options),
        `// @ts-ignore\n${HELPER_PREFIX}expose;\nconst ${HELPER_PREFIX}expose =`,
      )
      rootMap.get(root)!.defineExpose =
        `(exposed: typeof ${HELPER_PREFIX}expose) => {}`
    } else if (
      macroName.startsWith('defineStyle') &&
      ts.isVariableStatement(node)
    ) {
      ;(rootMap.get(root)!.defineStyle ??= [])!.push(expression)
    }
  }

  ts.forEachChild(sfc[source]!.ast, (node) => walk(node, []))
  return rootMap
}
