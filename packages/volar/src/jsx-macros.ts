import { createFilter } from '@vue-macros/common'
import { toValidAssetId } from '@vue/compiler-dom'
import { allCodeFeatures } from '@vue/language-core'
import { replaceSourceRange } from 'muggle-string'
import { getStart, getText, type VueMacrosPlugin } from './common'
import type { TransformOptions } from './jsx-directive/index'
import type {
  ArrowFunction,
  CallExpression,
  FunctionDeclaration,
  Node,
} from 'typescript'

function isFunction(
  node: Node,
  ts: typeof import('typescript'),
): node is ArrowFunction | FunctionDeclaration {
  return ts.isArrowFunction(node) || ts.isFunctionDeclaration(node)
}

export function transformJsxMacros(options: TransformOptions): void {
  const { ts, sfc, source, codes } = options
  const rootMap = new Map<
    ArrowFunction | FunctionDeclaration,
    Map<string, string[]>
  >()

  function walk(node: Node, parents: Node[]) {
    const root =
      parents[1] && isFunction(parents[1], ts) ? parents[1] : undefined
    const macro = root && getMacroCall(node, ts)
    if (macro) {
      if (!rootMap.has(root)) {
        rootMap.set(
          root,
          new Map([
            ['defineSlots', []],
            ['defineModel', []],
            ['defineExpose', []],
          ]),
        )
      }
      const propMap = rootMap.get(root)!
      const name = getText(macro.expression, options)

      if (name === 'defineModel') {
        const modelName =
          macro.arguments[0] && ts.isStringLiteralLike(macro.arguments[0])
            ? macro.arguments[0].text
            : 'modelValue'
        const modelOptions =
          macro.arguments[0] && ts.isStringLiteralLike(macro.arguments[0])
            ? macro.arguments[1]
            : macro.arguments[0]
        let required = false
        if (modelOptions && ts.isObjectLiteralExpression(modelOptions)) {
          for (const prop of modelOptions.properties) {
            if (
              ts.isPropertyAssignment(prop) &&
              getText(prop.name, options) === 'required'
            ) {
              required = prop.initializer.kind === ts.SyntaxKind.TrueKeyword
            }
          }
        }
        const id = toValidAssetId(modelName, '_VLS_model' as any)
        const typeString = `import("vue").UnwrapRef<typeof ${id}>`
        const requiredString = required ? ':' : '?:'
        propMap
          .get(name)
          ?.push(
            `${modelName}${requiredString} ${typeString}`,
            `'onUpdate:${modelName}'${requiredString} ($event: ${typeString}) => any`,
          )
        replaceSourceRange(
          codes,
          source,
          getStart(macro, options),
          getStart(macro, options),
          `${id}; let ${id} =`,
          ['__MACROS_', source, getStart(macro, options), allCodeFeatures],
        )
      } else if (name === 'defineSlots') {
        replaceSourceRange(
          codes,
          source,
          getStart(macro, options),
          getStart(macro, options),
          `__MACROS_slots; let __MACROS_slots =`,
          [
            '__MACROS_',
            source,
            getStart(macro.expression, options),
            allCodeFeatures,
          ],
        )
        propMap.get(name)?.push('{ vSlots?: typeof __MACROS_slots }')
      } else if (name === 'defineExpose') {
        replaceSourceRange(
          codes,
          source,
          getStart(macro, options),
          getStart(macro, options),
          `let __MACROS_expose = ${getText(macro.arguments[0], options)};`,
          ['__MACROS_', source, getStart(macro, options), allCodeFeatures],
        )
        propMap
          .get(name)
          ?.push('{ vExpose?: (exposed: typeof __MACROS_expose) => any }')
      }
    }

    ts.forEachChild(node, (child) => {
      parents.unshift(node)
      walk(child, parents)
      parents.shift()
    })
  }
  ts.forEachChild(sfc[source]!.ast, (node) => walk(node, []))

  for (const [root, props] of rootMap) {
    const result: string[] = []
    for (const [name, members] of props) {
      if (name === 'defineModel') {
        result.push(`{${members.join(', ')}}`)
      } else {
        result.push(members.join(''))
      }
    }

    if (ts.isFunctionDeclaration(root) && root.body) {
      replaceSourceRange(
        codes,
        source,
        root.parameters.pos,
        getStart(root.body, options),
        `_props: `,
        root.parameters[0]?.type
          ? `${getText(root.parameters[0].type, options)} & `
          : '',
        `Awaited<typeof __MACROS_setup>['props'], __MACROS_setup = ((${getText(root.parameters[0], options)}) =>`,
      )
      replaceSourceRange(
        codes,
        source,
        root.body.end - 1,
        root.body.end - 1,
        `})()){ return {} as Awaited<typeof __MACROS_setup>['render']`,
      )
    } else {
      replaceSourceRange(
        codes,
        source,
        getStart(root.parameters, options),
        getStart(root.parameters, options),
        `_props: `,
        root.parameters[0]?.type
          ? `${getText(root.parameters[0].type, options)} & `
          : '',
        `Awaited<typeof __MACROS_setup>['props'], __MACROS_setup = ((`,
      )
      replaceSourceRange(
        codes,
        source,
        root.end,
        root.end,
        `)()) => ({}) as Awaited<typeof __MACROS_setup>['render']`,
      )
    }
    root.body &&
      ts.forEachChild(root.body, (node) => {
        if (ts.isReturnStatement(node) && node.expression) {
          replaceSourceRange(
            codes,
            source,
            getStart(node, options),
            getStart(node.expression, options),
            `return { props: {} as ${result.join(' &\n')},`,
            `render: `,
          )
          replaceSourceRange(
            codes,
            source,
            node.expression.end,
            node.expression.end,
            `}`,
          )
        }
      })
  }

  if (rootMap.size) {
    codes.push(`
declare function __MACROS_defineSlots<T extends Record<string, any>>(slots?: T): T
declare const __MACROS_defineExpose: typeof import('vue').defineExpose;
declare const __MACROS_defineModel: typeof import('vue').defineModel;\n`)
  }
}

function getMacroCall(
  node: import('typescript').Node | undefined,
  ts: typeof import('typescript'),
): CallExpression | undefined {
  if (!node) return

  if (ts.isVariableStatement(node)) {
    return ts.forEachChild(node.declarationList, (decl) => getExpression(decl))
  } else {
    return getExpression(node)
  }

  function getExpression(decl: Node) {
    if (
      ts.isVariableDeclaration(decl) &&
      decl.initializer &&
      ts.isCallExpression(decl.initializer) &&
      ts.isIdentifier(decl.initializer.expression)
    ) {
      const expression =
        decl.initializer.expression.escapedText === '$'
          ? decl.initializer.arguments[0]
          : decl.initializer
      if (isMacroCall(expression)) return expression
    } else if (ts.isExpressionStatement(decl) && isMacroCall(decl.expression)) {
      return decl.expression
    }
  }

  function isMacroCall(node: Node): node is CallExpression {
    return !!(
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      ['defineSlots', 'defineModel', 'defineExpose'].includes(
        node.expression.escapedText!,
      )
    )
  }
}

const plugin: VueMacrosPlugin<'jsxMacros'> = (ctx, options = {}) => {
  if (!options) return []

  const filter = createFilter(options)

  return {
    name: 'vue-macros-jsx-macros',
    version: 2.1,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (!filter(fileName) || !['tsx'].includes(embeddedFile.lang)) return

      for (const source of ['script', 'scriptSetup'] as const) {
        if (!sfc[source]) return
        transformJsxMacros({
          codes: embeddedFile.content,
          sfc,
          ts: ctx.modules.typescript,
          source,
          vueVersion: ctx.vueCompilerOptions.target,
        })
      }
    },
  }
}
export default plugin
