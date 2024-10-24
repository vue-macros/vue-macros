import {
  babelParse,
  generateTransform,
  getLang,
  HELPER_PREFIX,
  MagicStringAST,
  walkAST,
  type CodeTransform,
} from '@vue-macros/common'
import type { OptionsResolved } from '..'
import { transformDefineComponent } from './define-component'
import { transformDefineExpose } from './define-expose'
import { transformDefineModel } from './define-model'
import { transformDefineSlots } from './define-slots'
import { transformDefineStyle } from './define-style'
import type {
  ArrowFunctionExpression,
  CallExpression,
  FunctionDeclaration,
  FunctionExpression,
  Node,
} from '@babel/types'

export type FunctionalNode =
  | FunctionDeclaration
  | FunctionExpression
  | ArrowFunctionExpression

export type RootMapValue = {
  defineComponent?: CallExpression
  defineModel?: {
    expression: CallExpression
    isRequired: boolean
  }[]
  defineSlots?: CallExpression
  defineExpose?: CallExpression
  defineStyle?: {
    expression: CallExpression
    lang: string
  }[]
}

export function transformJsxMacros(
  code: string,
  id: string,
  importMap: Map<string, string>,
  options: OptionsResolved,
): CodeTransform | undefined {
  const s = new MagicStringAST(code)
  const rootMap = getRootMap(s, id)
  let defineStyleIndex = 0

  for (const [root, map] of rootMap) {
    if (map.defineStyle?.length) {
      map.defineStyle.forEach(({ expression, lang }) => {
        transformDefineStyle(
          expression,
          lang,
          root,
          defineStyleIndex++,
          s,
          importMap,
        )
      })
    }

    if (root === undefined) continue

    let propsName = `${HELPER_PREFIX}props`
    if (root.params[0]) {
      if (root.params[0].type === 'Identifier') {
        propsName = root.params[0].name
      } else if (root.params[0].type === 'ObjectPattern') {
        const lastProp = root.params[0].properties.at(-1)
        if (lastProp?.type !== 'RestElement') {
          s.appendRight(
            root.params[0].extra?.trailingComma
              ? (root.params[0].extra?.trailingComma as number) + 1
              : lastProp?.end || root.params[0].end! - 1,
            `${
              !root.params[0].extra?.trailingComma &&
              root.params[0].properties.length
                ? ','
                : ''
            } ...${HELPER_PREFIX}props`,
          )
        }
      }
    } else {
      s.appendRight(getParamsStart(root, s.original), propsName)
    }

    if (map.defineComponent) {
      transformDefineComponent(root, propsName, map, s)
    }
    if (map.defineModel?.length) {
      map.defineModel.forEach(({ expression }) => {
        transformDefineModel(expression, propsName, s)
      })
    }
    if (map.defineSlots) {
      transformDefineSlots(map.defineSlots, propsName, s, options.lib)
    }
    if (map.defineExpose) {
      transformDefineExpose(map.defineExpose, root, s, options.lib)
    }
  }

  return generateTransform(s, id)
}

function getRootMap(s: MagicStringAST, id: string) {
  const parents: (Node | undefined | null)[] = []
  const rootMap = new Map<FunctionalNode | undefined, RootMapValue>()
  walkAST<Node>(babelParse(s.original, getLang(id)), {
    enter(node, parent) {
      parents.unshift(parent)
      const root =
        parents[1] && isFunctionalNode(parents[1]) ? parents[1] : undefined

      if (
        parents[2]?.type === 'CallExpression' &&
        s.sliceNode(parents[2].callee) === 'defineComponent'
      ) {
        if (!rootMap.has(root)) rootMap.set(root, {})
        if (!rootMap.get(root)!.defineComponent) {
          rootMap.get(root)!.defineComponent = parents[2]
        }
      }

      const expression =
        node.type === 'VariableDeclaration'
          ? node.declarations[0].init
          : node.type === 'ExpressionStatement'
            ? node.expression
            : undefined
      const macroExpression = getMacroExpression(expression)
      if (!macroExpression) return
      if (!rootMap.has(root)) rootMap.set(root, {})
      const macroName = s.sliceNode(macroExpression.callee)
      if (macroName) {
        if (macroName === 'defineModel') {
          ;(rootMap.get(root)!.defineModel ??= []).push({
            expression: macroExpression,
            isRequired: expression?.type === 'TSNonNullExpression',
          })
        } else if (macroName.startsWith('defineStyle')) {
          const [, lang = 'css'] = macroName.split('.')
          ;(rootMap.get(root)!.defineStyle ??= []).push({
            expression: macroExpression,
            lang,
          })
        } else if (
          macroName === 'defineSlots' ||
          macroName === 'defineExpose'
        ) {
          rootMap.get(root)![macroName] = macroExpression
        }
      }
    },
    leave() {
      parents.shift()
    },
  })
  return rootMap
}

export function isFunctionalNode(node?: Node | null): node is FunctionalNode {
  return !!(
    node &&
    (node.type === 'ArrowFunctionExpression' ||
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression')
  )
}

export function getMacroExpression(
  node: Node | null | undefined,
): CallExpression | undefined {
  if (node?.type === 'TSNonNullExpression') {
    node = node.expression
  }

  if (node?.type === 'CallExpression') {
    if (
      node.callee.type === 'MemberExpression' &&
      node.callee.object.type === 'Identifier' &&
      node.callee.object.name === 'defineStyle'
    ) {
      return node
    } else if (
      node.callee.type === 'Identifier' &&
      ['defineSlots', 'defineModel', 'defineExpose', 'defineStyle'].includes(
        node.callee.name!,
      )
    ) {
      return node
    }
  }
}

export function getParamsStart(node: FunctionalNode, code: string): number {
  return node.params[0]
    ? node.params[0].start!
    : node.start! +
        (code.slice(node.start!, node.body.start!).match(/\(\s*\)/)?.index ||
          0) +
        1
}
