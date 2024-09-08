import {
  babelParse,
  generateTransform,
  getLang,
  HELPER_PREFIX,
  importHelperFn,
  MagicStringAST,
  walkAST,
  type CodeTransform,
} from '@vue-macros/common'
import type { OptionsResolved } from '..'
import { useExposeHelperId, useModelHelperId } from './helper'
import type {
  ArrowFunctionExpression,
  CallExpression,
  FunctionDeclaration,
  FunctionExpression,
  Node,
} from '@babel/types'

export function transformJsxMacros(
  code: string,
  id: string,
  options: OptionsResolved,
): CodeTransform | undefined {
  const s = new MagicStringAST(code)

  const parents: (Node | undefined | null)[] = []
  const roots: Map<
    FunctionDeclaration | FunctionExpression | ArrowFunctionExpression,
    Map<string, CallExpression[]>
  > = new Map()
  walkAST<Node>(babelParse(code, getLang(id)), {
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
      if (!root || !isMacro(expression)) return

      if (!roots.has(root))
        roots.set(
          root,
          new Map([
            ['defineModel', []],
            ['defineSlots', []],
            ['defineExpose', []],
          ]),
        )
      const map = roots.get(root)!
      const macroName = s.sliceNode(expression.callee)
      if (macroName) {
        map.get(macroName)?.push(expression)
      }
    },
    leave() {
      parents.shift()
    },
  })

  for (const [root, map] of roots) {
    let propsName = `${HELPER_PREFIX}props`
    const paramsStart = root.params[0]
      ? root.params[0].start!
      : root.start! +
        (s.slice(root.start!, root.body.start!).match(/\(\s*\)/)?.index || 0) +
        1
    if (root.params[0]) {
      if (root.params[0].type === 'Identifier') {
        propsName = root.params[0].name
      } else if (root.params[0].type === 'ObjectPattern') {
        const param = root.params[0].properties.find(
          (i) => i.type === 'RestElement',
        )
        if (param && param?.argument.type === 'Identifier') {
          propsName = param.argument.name
        } else if (
          root.params[0].type === 'ObjectPattern' &&
          root.params[0].properties.at(-1)
        ) {
          s.appendLeft(
            root.params[0].properties.at(-1)!.end!,
            `, ...${HELPER_PREFIX}props`,
          )
        }
      }
    } else {
      s.appendRight(paramsStart, `${HELPER_PREFIX}props`)
    }

    for (const [macroName, nodes] of map) {
      for (const node of nodes) {
        if (macroName === 'defineSlots') {
          s.overwrite(
            node.start!,
            (node.arguments[0]?.start && node.arguments[0].start - 1) ||
              node.typeArguments?.end ||
              node.callee.end!,
            `Object.assign`,
          )
          const slots = `${importHelperFn(s, 0, 'getCurrentInstance', options.lib)}()?.slots`
          s.appendLeft(
            node.end! - 1,
            `${node.arguments[0] ? ',' : '{}, '}${slots}`,
          )
        } else if (macroName === 'defineModel') {
          s.overwriteNode(
            node.callee,
            importHelperFn(s, 0, 'useModel', useModelHelperId),
          )
          s.appendRight(
            node.arguments[0]?.start || node.end! - 1,
            `${propsName}, ${node.arguments.length && node.arguments[0].type !== 'StringLiteral' ? `'modelValue',` : ''}`,
          )
        } else if (macroName === 'defineExpose') {
          s.overwriteNode(
            node.callee,
            importHelperFn(s, 0, 'useExpose', useExposeHelperId),
          )
          s.appendRight(
            node.arguments[0]?.start || node.end! - 1,
            `${importHelperFn(s, 0, 'getCurrentInstance', options.lib)}(), `,
          )
        }
      }
    }
  }

  return generateTransform(s, id)
}

function isMacro(node?: Node | null): node is CallExpression {
  return !!(
    node &&
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    ['defineSlots', 'defineModel', 'defineExpose'].includes(node.callee.name)
  )
}
