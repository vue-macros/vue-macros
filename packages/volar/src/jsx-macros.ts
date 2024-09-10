import { createFilter, HELPER_PREFIX } from '@vue-macros/common'
import { toValidAssetId } from '@vue/compiler-dom'
import { allCodeFeatures } from '@vue/language-core'
import { replaceSourceRange } from 'muggle-string'
import { getStart, getText, type VueMacrosPlugin } from './common'
import type { TransformOptions } from './jsx-directive/index'

type RootMap = Map<
  | import('typescript').ArrowFunction
  | import('typescript').FunctionExpression
  | import('typescript').FunctionDeclaration,
  Map<string, string[]>
>

function getMacro(
  node: import('typescript').Node | undefined,
  ts: typeof import('typescript'),
): import('typescript').CallExpression | undefined {
  if (!node) return

  if (ts.isVariableStatement(node)) {
    return ts.forEachChild(node.declarationList, (decl) => getExpression(decl))
  } else {
    return getExpression(node)
  }

  function getExpression(decl: import('typescript').Node) {
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
      if (isMacro(expression)) return expression
    } else if (ts.isExpressionStatement(decl) && isMacro(decl.expression)) {
      return decl.expression
    }
  }

  function isMacro(
    node: import('typescript').Node,
  ): node is import('typescript').CallExpression {
    return !!(
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      ['defineSlots', 'defineModel', 'defineExpose'].includes(
        node.expression.escapedText!,
      )
    )
  }
}

function getRootMap(options: TransformOptions): RootMap {
  const { ts, sfc, source, codes } = options
  const rootMap: RootMap = new Map()

  function walk(
    node: import('typescript').Node,
    parents: import('typescript').Node[],
  ) {
    const root =
      parents[1] &&
      (ts.isArrowFunction(parents[1]) ||
        ts.isFunctionExpression(parents[1]) ||
        ts.isFunctionDeclaration(parents[1]))
        ? parents[1]
        : undefined
    const macro = root && getMacro(node, ts)
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
        const id = toValidAssetId(modelName, `${HELPER_PREFIX}model` as any)
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
          `// @ts-ignore\n${id};\nlet ${id} =`,
          [HELPER_PREFIX, source, getStart(macro, options), allCodeFeatures],
        )
      } else if (name === 'defineSlots') {
        replaceSourceRange(
          codes,
          source,
          getStart(macro, options),
          getStart(macro, options),
          `// @ts-ignore\n${HELPER_PREFIX}slots;\nlet ${HELPER_PREFIX}slots =`,
          [
            HELPER_PREFIX,
            source,
            getStart(macro.expression, options),
            allCodeFeatures,
          ],
        )
        propMap.get(name)?.push(`{ vSlots?: typeof ${HELPER_PREFIX}slots }`)
      } else if (name === 'defineExpose') {
        replaceSourceRange(
          codes,
          source,
          getStart(macro, options),
          getStart(macro, options),
          `const ${HELPER_PREFIX}expose = ${getText(macro.arguments[0], options)};`,
          [HELPER_PREFIX, source, getStart(macro, options), allCodeFeatures],
        )
        propMap
          .get(name)
          ?.push(`(exposed: typeof ${HELPER_PREFIX}expose) => {}`)
      }
    }

    ts.forEachChild(node, (child) => {
      parents.unshift(node)
      walk(child, parents)
      parents.shift()
    })
  }
  ts.forEachChild(sfc[source]!.ast, (node) => walk(node, []))
  return rootMap
}

function transformJsxMacros(rootMap: RootMap, options: TransformOptions): void {
  const { ts, source, codes } = options

  for (const [root, props] of rootMap) {
    if (!root.body) continue
    const asyncPrefix = root.modifiers?.find(
      (modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword,
    )
      ? 'async'
      : ''
    const result = `({}) as Awaited<typeof ${HELPER_PREFIX}setup>['render'] & { __ctx: Awaited<typeof ${
      HELPER_PREFIX
    }setup> }`

    if (ts.isArrowFunction(root)) {
      replaceSourceRange(
        codes,
        source,
        getStart(root.parameters, options),
        getStart(root.parameters, options),
        `${HELPER_PREFIX}props: `,
        root.parameters[0]?.type
          ? `${getText(root.parameters[0].type, options)} & `
          : '',
        `Awaited<typeof ${HELPER_PREFIX}setup>['props'], ${HELPER_PREFIX}setup = (${asyncPrefix}(`,
      )
      replaceSourceRange(
        codes,
        source,
        root.end,
        root.end,
        `)({} as any)) => `,
        result,
      )
    } else {
      replaceSourceRange(
        codes,
        source,
        root.parameters.pos,
        root.parameters.pos,
        `${HELPER_PREFIX}props: `,
        root.parameters[0]?.type
          ? `${getText(root.parameters[0].type, options)} & `
          : '',
        `Awaited<typeof ${HELPER_PREFIX}setup>['props'], ${HELPER_PREFIX}setup = (${asyncPrefix}(`,
      )
      replaceSourceRange(
        codes,
        source,
        getStart(root.body, options),
        getStart(root.body, options),
        '=>',
      )
      replaceSourceRange(
        codes,
        source,
        root.body.end - 1,
        root.body.end - 1,
        `})({} as any)){ return `,
        result,
      )
    }

    ts.forEachChild(root.body, (node) => {
      if (ts.isReturnStatement(node) && node.expression) {
        replaceSourceRange(
          codes,
          source,
          getStart(node, options),
          getStart(node.expression, options),
          `return {\nprops: {} as `,
          props.get('defineModel')?.length
            ? `{ ${props.get('defineModel')?.join(', ')} }`
            : '{}',
          props.get('defineSlots')?.length
            ? ` & ${props.get('defineSlots')?.join()}`
            : '',
          props.get('defineExpose')?.length
            ? `,\nexpose: ${props.get('defineExpose')?.join()}`
            : '',
          `,\nrender: `,
        )
        replaceSourceRange(
          codes,
          source,
          node.expression.end,
          node.expression.end,
          `\n}`,
        )
      }
    })
  }

  if (
    rootMap.size &&
    !codes.toString().includes(`declare function ${HELPER_PREFIX}defineSlots`)
  ) {
    codes.push(`
declare function ${HELPER_PREFIX}defineSlots<T extends Record<string, any>>(slots?: T): T
declare const ${HELPER_PREFIX}defineExpose: typeof import('vue').defineExpose;
declare const ${HELPER_PREFIX}defineModel: typeof import('vue').defineModel;\n`)
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
        if (!sfc[source]) continue
        const options = {
          sfc,
          source,
          ts: ctx.modules.typescript,
          codes: embeddedFile.content,
        }
        const rootMap = getRootMap(options)
        if (rootMap.size) transformJsxMacros(rootMap, options)
      }
    },
  }
}
export default plugin
