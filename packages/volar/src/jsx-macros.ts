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
    return (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      [
        ...vueCompilerOptions.macros.defineModel,
        ...vueCompilerOptions.macros.defineExpose,
        ...vueCompilerOptions.macros.defineSlots,
        'defineStyle',
      ].includes(node.expression.escapedText!) &&
      node
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
    const result = `({}) as __VLS_MaybeReturnType<Awaited<ReturnType<typeof ${
      HELPER_PREFIX
    }setup>>['render']> & { __ctx: Awaited<ReturnType<typeof ${
      HELPER_PREFIX
    }setup>> }`

    const propsType = root.parameters[0]?.type
      ? String(getText(root.parameters[0].type, options))
      : '{}'
    replaceSourceRange(
      codes,
      source,
      getStart(root.parameters, options),
      getStart(root.parameters, options),
      `${HELPER_PREFIX}props: Awaited<ReturnType<typeof ${HELPER_PREFIX}setup>>['props'] & ${propsType},`,
      `${HELPER_PREFIX}setup = (${asyncModifier ? 'async' : ''}(`,
    )
    if (ts.isArrowFunction(root)) {
      replaceSourceRange(codes, source, root.end, root.end, `)) => `, result)
    } else {
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
        root.end,
        root.end,
        `)){ return `,
        result,
        '}',
      )
    }

    ts.forEachChild(root.body, (node) => {
      if (ts.isReturnStatement(node) && node.expression) {
        const defaultProps = []
        const elements =
          root.parameters[0] &&
          !root.parameters[0].type &&
          ts.isObjectBindingPattern(root.parameters[0].name)
            ? root.parameters[0].name.elements
            : []
        for (const element of elements) {
          if (ts.isIdentifier(element.name))
            defaultProps.push(
              `${element.name.escapedText}${
                element.initializer &&
                ts.isNonNullExpression(element.initializer)
                  ? ':'
                  : '?:'
              } typeof ${element.name.escapedText}`,
            )
        }

        replaceSourceRange(
          codes,
          source,
          getStart(node, options),
          getStart(node.expression, options),
          `return {\nprops: {} as `,
          options.vueVersion ? `import('vue').PublicProps & ` : '',
          `{${defaultProps.join(', ')}} & `,
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
}

const plugin: VueMacrosPlugin<'jsxMacros'> = (ctx, options = {}) => {
  if (!options) return []

  const filter = createFilter(options)
  const { version: vueVersion } = options

  return {
    name: 'vue-macros-jsx-macros',
    version: 2.1,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (!filter(fileName) || embeddedFile.lang !== 'tsx') return

      for (const source of ['script', 'scriptSetup'] as const) {
        if (!sfc[source]) continue
        const options = {
          sfc,
          source,
          ts: ctx.modules.typescript,
          codes: embeddedFile.content,
          vueVersion,
        }
        const rootMap = getRootMap(options, ctx.vueCompilerOptions)
        if (rootMap.size) transformJsxMacros(rootMap, options)

        if (
          (fileName.endsWith('.tsx') || rootMap.size) &&
          !embeddedFile.content
            .toString()
            .includes(`declare function defineSlots`)
        ) {
          embeddedFile.content.push(
            `
const { defineModel } = await import('vue')
declare function defineSlots<T extends Record<string, any>>(slots?: T): T;
declare function defineExpose<Exposed extends Record<string, any> = Record<string, any>>(exposed?: Exposed): Exposed;
type __VLS_DefineStyle = (style: string, options?: { scoped: boolean }) => void;
declare const defineStyle: { (style: string): void; scss: __VLS_DefineStyle; sass: __VLS_DefineStyle; stylus: __VLS_DefineStyle; less: __VLS_DefineStyle; postcss: __VLS_DefineStyle };
declare function ${HELPER_PREFIX}defineComponent<T extends ((props?: any) => any)>(setup: T, options?: Pick<import('vue').ComponentOptions, 'name' | 'inheritAttrs'> & { props?: import('vue').ComponentObjectPropsOptions }): T
declare type __VLS_MaybeReturnType<T> = T extends (...args: any) => any ? ReturnType<T> : T;
      `,
          )
        }
      }
    },
  }
}
export default plugin
