import {
  replace,
  replaceAll,
  replaceSourceRange,
  toString,
} from 'muggle-string'
import { addCode } from './common'
import type { Code, Sfc, VueLanguagePlugin } from '@vue/language-core'

function transformTemplateRef({
  nodes,
  codes,
  ts,
}: {
  nodes: import('typescript').VariableDeclaration[]
  codes: Code[]
  ts: typeof import('typescript')
}) {
  const refs: string[] = []
  for (const decl of nodes) {
    if (decl.initializer && ts.isCallExpression(decl.initializer)) {
      const {
        expression,
        arguments: [argument],
      } = decl.initializer

      if (ts.isStringLiteralLike(argument)) {
        replaceSourceRange(
          codes,
          'scriptSetup',
          expression.end,
          expression.end,
          `<Parameters<Required<typeof __VLS_ctx_${argument.text}>['expose']>[0] | null>`,
        )
        if (ts.isIdentifier(decl.name)) {
          const name = decl.name.escapedText
          refs.push(`${name}: ${name}.value`)
          replace(codes, new RegExp(`${name}: ${name} as typeof ${name},`))
          replaceAll(
            codes,
            new RegExp(`__VLS_ctx(?=\\.${name})`, 'g'),
            `__VLS_refs`,
          )
        }
      }
    }
  }
  addCode(codes, `const __VLS_refs = {\n${refs.join(',\n')}\n}`)

  replace(codes, /function __VLS_template\(\) {/)
  replace(codes, /(?<=__VLS_defineComponent\([\S\s]*?\);)\n}/)
  replace(
    codes,
    /return __VLS_slots;\n/,
    'function __VLS_template(){\nreturn __VLS_slots;\n}',
  )

  const codeString = toString(codes)
  for (const [, tagName, props, ref] of codeString.matchAll(
    /__VLS_asFunctionalComponent\((.*), new \1\({(.*ref: \("(.*)"\).*)}\)\)/g,
  )) {
    if (tagName.startsWith('__VLS_')) {
      const result = codeString.match(
        new RegExp(`(const ${tagName}) = [\\s\\S]*?;\n`),
      )
      if (result) {
        addCode(codes, '// @ts-ignore\n', result[0])
      }
    }
    addCode(
      codes,
      `const __VLS_ctx_${ref} = __VLS_pickFunctionalComponentCtx(${tagName}, __VLS_asFunctionalComponent(${tagName})({${props}}));\n`,
    )
  }
}

function getTemplateRefNodes(
  ts: typeof import('typescript'),
  sfc: Sfc,
  alias: string[],
) {
  function isTemplateRefCall(
    node: import('typescript').Node,
  ): node is import('typescript').CallExpression {
    return (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      !node.typeArguments?.length &&
      alias.includes(node.expression.escapedText!)
    )
  }

  const result: import('typescript').VariableDeclaration[] = []
  const sourceFile = sfc.scriptSetup!.ast
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isVariableStatement(node)) {
      return ts.forEachChild(node.declarationList, (decl) => {
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
          if (isTemplateRefCall(expression)) result.push(decl)
        }
      })
    }
  })

  return result
}

const plugin: VueLanguagePlugin = ({
  modules: { typescript: ts },
  vueCompilerOptions: { vueMacros },
}) => {
  return {
    name: 'vue-macros-template-ref',
    version: 2,
    resolveEmbeddedCode(_, sfc, embeddedFile) {
      if (!sfc.scriptSetup || !sfc.scriptSetup.ast) return

      const alias = vueMacros?.templateRef?.alias || [
        'templateRef',
        'useTemplateRef',
      ]
      const nodes = getTemplateRefNodes(ts, sfc, alias)
      if (!nodes.length) return

      transformTemplateRef({
        nodes,
        codes: embeddedFile.content,
        ts,
      })
    },
  }
}
export default plugin
