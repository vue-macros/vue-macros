import {
  babelParse,
  generateTransform,
  getLang,
  HELPER_PREFIX,
  isCallOf,
  MagicStringAST,
  walkAST,
  type CodeTransform,
} from '@vue-macros/common'
import type { OptionsResolved } from '..'
import {
  transformReactDefineExpose,
  transformVueDefineExpose,
} from './define-expose'
import { transformDefineModel } from './define-model'
import { transformDefineSlots } from './define-slots'
import { transformSetupFC } from './setup-fc'
import type {
  ArrowFunctionExpression,
  CallExpression,
  FunctionDeclaration,
  FunctionExpression,
  Node,
} from '@babel/types'

export { restructure } from './setup-fc/restructure'

export type FunctionalNode =
  | FunctionDeclaration
  | FunctionExpression
  | ArrowFunctionExpression

function isMacro(node?: Node | null): node is CallExpression {
  node = isCallOf(node, '$') ? node.arguments[0] : node
  return !!(
    node &&
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    ['defineSlots', 'defineModel', 'defineExpose'].includes(node.callee.name)
  )
}

function getRootMap(s: MagicStringAST, id: string) {
  const parents: (Node | undefined | null)[] = []
  const rootMap: Map<
    FunctionalNode,
    {
      isSetupFC?: boolean
      defineModel?: CallExpression[]
      defineSlots?: CallExpression
      defineExpose?: CallExpression
    }
  > = new Map()
  walkAST<Node>(babelParse(s.original, getLang(id)), {
    enter(node, parent) {
      parents.unshift(parent)
      const expression =
        node.type === 'VariableDeclaration'
          ? node.declarations[0].init
          : node.type === 'ExpressionStatement'
            ? node.expression
            : undefined
      const root =
        parents[1] &&
        (parents[1].type === 'ArrowFunctionExpression' ||
          parents[1].type === 'FunctionDeclaration' ||
          parents[1].type === 'FunctionExpression')
          ? parents[1]
          : undefined
      if (!root) return

      let isSetupFC = false
      if (
        root.type !== 'FunctionDeclaration' &&
        parents[2]?.type === 'VariableDeclarator' &&
        parents[2].id.type === 'Identifier' &&
        parents[2].id.typeAnnotation?.type === 'TSTypeAnnotation' &&
        s.sliceNode(parents[2].id.typeAnnotation.typeAnnotation) === 'SetupFC'
      ) {
        isSetupFC = true
        if (!rootMap.has(root)) rootMap.set(root, {})
        rootMap.get(root)!.isSetupFC = isSetupFC
      }

      if (!isMacro(expression)) return
      if (!rootMap.has(root)) rootMap.set(root, {})
      const macro =
        isCallOf(expression, '$') &&
        expression.arguments[0].type === 'CallExpression'
          ? expression.arguments[0]
          : expression
      const macroName = s.sliceNode(macro.callee)
      if (macroName) {
        if (macroName === 'defineModel')
          (rootMap.get(root)!.defineModel ??= []).push(macro)
        else if (macroName === 'defineSlots' || macroName === 'defineExpose')
          rootMap.get(root)![macroName] = expression
      }
    },
    leave() {
      parents.shift()
    },
  })
  return rootMap
}

export function getParamsStart(node: FunctionalNode, code: string): number {
  return node.params[0]
    ? node.params[0].start!
    : node.start! +
        (code.slice(node.start!, node.body.start!).match(/\(\s*\)/)?.index ||
          0) +
        1
}

export function transformJsxMacros(
  code: string,
  id: string,
  options: OptionsResolved,
): CodeTransform | undefined {
  const s = new MagicStringAST(code)
  const rootMap = getRootMap(s, id)

  for (const [root, map] of rootMap) {
    let propsName = `${HELPER_PREFIX}props`
    if (root.params[0]) {
      if (root.params[0].type === 'Identifier') {
        propsName = root.params[0].name
      } else if (root.params[0].type === 'ObjectPattern') {
        const lastProp = root.params[0].properties.at(-1)
        if (
          lastProp?.type === 'RestElement' &&
          lastProp.argument.type === 'Identifier'
        ) {
          propsName = lastProp.argument.name
        } else if (lastProp) {
          s.appendRight(
            root.params[0].extra?.trailingComma
              ? (root.params[0].extra?.trailingComma as number) + 1
              : lastProp.end!,
            `${root.params[0].extra?.trailingComma ? '' : ','} ...${HELPER_PREFIX}props`,
          )
        }
      }
    } else {
      s.appendRight(getParamsStart(root, s.original), `${HELPER_PREFIX}props`)
    }

    if (map.defineModel?.length && !map.isSetupFC) {
      map.defineModel.forEach((node) => {
        transformDefineModel(node, propsName, s)
      })
    }
    if (map.defineSlots) {
      transformDefineSlots(map.defineSlots, propsName, s, options.lib)
    }
    if (map.defineExpose && !map.isSetupFC) {
      if (options.lib.includes('vue')) {
        transformVueDefineExpose(map.defineExpose, s, options.lib)
      } else if (options.lib.includes('react')) {
        transformReactDefineExpose(map.defineExpose, root, s, options.lib)
      }
    }

    if (map.isSetupFC) {
      transformSetupFC(root, s)
    }
  }

  return generateTransform(s, id)
}
