import { createFilter, HELPER_PREFIX } from '@vue-macros/common'
import { toValidAssetId } from '@vue/compiler-dom'
import { replaceSourceRange } from 'muggle-string'
import { getStart, getText, type VueMacrosPlugin } from './common'
import type { TransformOptions } from './jsx-directive/index'
import type { VueCompilerOptions } from '@vue/language-core'

type RootMap = Map<
  | import('typescript').ArrowFunction
  | import('typescript').FunctionExpression
  | import('typescript').FunctionDeclaration,
  {
    defineModel?: string[]
    defineSlots?: string
    defineExpose?: string
    setupFC?: {
      start: number
      end: number
    }
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
      isReactivityTransform?: boolean
    }
  | undefined {
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
      const isReactivityTransform =
        decl.initializer.expression.escapedText === '$'
      const expression = isReactivityTransform
        ? decl.initializer.arguments[0]
        : decl.initializer
      if (isMacro(expression))
        return {
          expression,
          isReactivityTransform,
          initializer: decl.initializer,
        }
    } else if (ts.isExpressionStatement(decl) && isMacro(decl.expression)) {
      return {
        expression: decl.expression,
        initializer: decl,
      }
    }
  }

  function isMacro(
    node: import('typescript').Node,
  ): node is import('typescript').CallExpression {
    return !!(
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      [
        ...vueCompilerOptions.macros.defineModel,
        ...vueCompilerOptions.macros.defineExpose,
        ...vueCompilerOptions.macros.defineSlots,
      ].includes(node.expression.escapedText!)
    )
  }
}

function getRootMap(
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
      ts.isVariableDeclaration(parents[2]) &&
      parents[2].type &&
      getText(parents[2].type, options) === 'SetupFC'
    ) {
      if (!rootMap.has(root)) rootMap.set(root, {})
      rootMap.get(root)!.setupFC = {
        start: parents[2].name.end,
        end: parents[2].type.end,
      }
    }
    if (
      parents[2] &&
      ts.isCallExpression(parents[2]) &&
      !parents[2].typeArguments &&
      ['defineComponent', 'defineSetupComponent'].includes(
        getText(parents[2].expression, options),
      )
    ) {
      if (!rootMap.has(root)) rootMap.set(root, {})
      rootMap.get(root)!.setupFC = {
        start: getStart(parents[2].expression, options),
        end: parents[2].expression.end,
      }
    }

    const macro = getMacro(node, ts, vueCompilerOptions)
    if (!macro) return

    const { expression, isReactivityTransform, initializer } = macro
    if (!rootMap.has(root)) rootMap.set(root, {})
    const name = getText(expression.expression, options)
    if (vueCompilerOptions.macros.defineModel.includes(name)) {
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
      ;(rootMap.get(root)!.defineModel ??= [])!.push(
        `${modelName}${requiredString} ${typeString}`,
        `'onUpdate:${modelName}'${requiredString} ($event: ${typeString}) => any`,
      )
      replaceSourceRange(
        codes,
        source,
        getStart(isReactivityTransform ? initializer : expression, options),
        getStart(isReactivityTransform ? initializer : expression, options),
        `// @ts-ignore\n${id};\nlet ${id} =`,
      )
    } else if (vueCompilerOptions.macros.defineSlots.includes(name)) {
      replaceSourceRange(
        codes,
        source,
        getStart(expression, options),
        getStart(expression, options),
        `// @ts-ignore\n${HELPER_PREFIX}slots;\nconst ${HELPER_PREFIX}slots =`,
      )
      rootMap.get(root)!.defineSlots =
        `{ vSlots?: typeof ${HELPER_PREFIX}slots }`
    } else if (vueCompilerOptions.macros.defineExpose.includes(name)) {
      replaceSourceRange(
        codes,
        source,
        getStart(expression, options),
        getStart(expression, options),
        `const ${HELPER_PREFIX}expose = ${getText(expression.arguments[0], options)};`,
      )
      rootMap.get(root)!.defineExpose =
        `(exposed: typeof ${HELPER_PREFIX}expose) => {}`
    }
  }

  ts.forEachChild(sfc[source]!.ast, (node) => walk(node, []))
  return rootMap
}

function transformJsxMacros(rootMap: RootMap, options: TransformOptions): void {
  const { ts, source, codes } = options

  for (const [root, map] of rootMap) {
    if (!root.body) continue
    const asyncModifier = root.modifiers?.find(
      (modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword,
    )
    if (asyncModifier)
      replaceSourceRange(codes, source, asyncModifier.pos, asyncModifier.end)
    const result = `({}) as __VLS_MaybeReturnType<Awaited<typeof ${HELPER_PREFIX}setup>['render']> & { __ctx: Awaited<typeof ${
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
        `Awaited<typeof ${HELPER_PREFIX}setup>['props'], ${HELPER_PREFIX}setup = (${asyncModifier ? 'async' : ''}(`,
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
        `Awaited<typeof ${HELPER_PREFIX}setup>['props'], ${HELPER_PREFIX}setup = (${asyncModifier ? 'async' : ''}(`,
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

    if (map.setupFC) {
      replaceSourceRange(codes, source, map.setupFC.start, map.setupFC.end)

      if (ts.isStatement(root.body)) {
        ts.forEachChild(root.body, (node) => {
          if (
            ts.isReturnStatement(node) &&
            node.expression &&
            !(
              ts.isArrowFunction(node.expression) ||
              ts.isFunctionExpression(node.expression)
            )
          ) {
            replaceSourceRange(
              codes,
              source,
              getStart(node.expression, options),
              getStart(node.expression, options),
              `() =>`,
            )
          }
        })
      } else {
        replaceSourceRange(
          codes,
          source,
          getStart(root.body, options),
          getStart(root.body, options),
          `() =>`,
        )
      }
    }

    ts.forEachChild(root.body, (node) => {
      if (ts.isReturnStatement(node) && node.expression) {
        replaceSourceRange(
          codes,
          source,
          getStart(node, options),
          getStart(node.expression, options),
          `return {\nprops: {} as `,
          map.defineModel?.length ? `{ ${map.defineModel?.join(', ')} }` : '{}',
          map.defineSlots ? ` & ${map.defineSlots}` : '',
          map.defineExpose ? `,\nexpose: ${map.defineExpose}` : '',
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
    codes.push(
      `
import { defineComponent, defineModel, defineExpose } from 'vue';
declare function defineSlots<T extends Record<string, any>>(slots?: T): T;
declare type __VLS_MaybeReturnType<T> = T extends (...args: any) => any ? ReturnType<T> : T;
`,
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
        if (!sfc[source]) continue
        const options = {
          sfc,
          source,
          ts: ctx.modules.typescript,
          codes: embeddedFile.content,
        }
        const rootMap = getRootMap(options, ctx.vueCompilerOptions)
        if (rootMap.size) transformJsxMacros(rootMap, options)
      }
    },
  }
}
export default plugin
