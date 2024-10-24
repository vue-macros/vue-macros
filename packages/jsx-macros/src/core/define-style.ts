import { walkAST, type MagicStringAST } from '@vue-macros/common'
import hash from 'hash-sum'
import { helperPrefix } from './helper'
import { isFunctionalNode, type FunctionalNode } from '.'
import type { CallExpression, Node } from '@babel/types'

export function transformDefineStyle(
  node: CallExpression,
  lang: string,
  root: FunctionalNode | undefined,
  defineStyleIndex: number,
  s: MagicStringAST,
  importMap: Map<string, string>,
): void {
  if (node.arguments[0]?.type !== 'TemplateLiteral') return

  let css = s.sliceNode(node.arguments[0]).slice(1, -1)
  const scopeId = hash(css)
  const vars = new Map<string, string>()
  node.arguments[0].expressions.forEach((expression) => {
    const cssVar = s.sliceNode(expression)
    const cssVarId = toCssVarId(cssVar, `--${scopeId}-`)
    s.overwrite(expression.start! - 2, expression.end! + 1, `var(${cssVarId})`)
    vars.set(cssVarId, cssVar)
  })

  let returnExpression = root && getReturnStatement(root)
  if (isFunctionalNode(returnExpression)) {
    returnExpression = getReturnStatement(returnExpression)
  }
  if (vars.size && returnExpression) {
    const children =
      returnExpression.type === 'JSXElement'
        ? [returnExpression]
        : returnExpression.type === 'JSXFragment'
          ? returnExpression.children
          : []
    const varString = Array.from(vars.entries())
      .map(([key, value]) => `'${key}': ${value}`)
      .join(', ')
    for (const child of children) {
      if (child.type === 'JSXElement') {
        s.appendRight(
          child.openingElement.name.end!,
          ` {...{style:{${varString}}}}`,
        )
      }
    }
  }

  let scoped = !!root
  if (node.arguments[1]?.type === 'ObjectExpression') {
    for (const prop of node.arguments[1].properties) {
      if (
        prop.type === 'ObjectProperty' &&
        prop.key.type === 'Identifier' &&
        prop.key.name === 'scoped' &&
        prop.value.type === 'BooleanLiteral'
      ) {
        scoped = prop.value.value
      }
    }
  }

  if (scoped && returnExpression) {
    walkAST<Node>(returnExpression, {
      enter(node) {
        if (
          node.type === 'JSXElement' &&
          s.sliceNode(node.openingElement.name) !== 'template'
        ) {
          s.appendRight(node.openingElement.name.end!, ` data-v-${scopeId}=""`)
        }
      },
    })
  }

  css = s.sliceNode(node.arguments[0]).slice(1, -1)
  const importId = `${helperPrefix}/define-style?index=${defineStyleIndex}&scopeId=${scopeId}&scoped=${scoped}&lang.${lang}`
  importMap.set(importId, css)
  s.appendLeft(0, `import "${importId}";`)
  s.removeNode(node)
}

function getReturnStatement(root: FunctionalNode) {
  if (root.body.type === 'BlockStatement') {
    const returnStatement = root.body.body.find(
      (node) => node.type === 'ReturnStatement',
    )
    if (returnStatement) {
      return returnStatement.argument
    }
  } else {
    return root.body
  }
}

function toCssVarId(name: string, prefix = '') {
  return (
    prefix +
    name.replaceAll(/\W/g, (searchValue, replaceValue) => {
      return searchValue === '.'
        ? '-'
        : name.charCodeAt(replaceValue).toString()
    })
  )
}
