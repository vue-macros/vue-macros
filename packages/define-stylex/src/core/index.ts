import {
  addNormalScript,
  DEFINE_STYLEX,
  generateTransform,
  importHelperFn,
  isCallOf,
  MagicStringAST,
  parseSFC,
  walkAST,
  type CodeTransform,
} from '@vue-macros/common'
import {
  createTransformContext,
  traverseNode,
  type DirectiveNode,
  type NodeTransform,
  type NodeTypes,
} from '@vue/compiler-dom'
import { styleXAttrsId } from './helper'
import type { CallExpression, Node } from '@babel/types'

const STYLEX_CREATE = '_stylex_create'
const STYLEX_PROPS = '_stylex_props'
const STYLEX_ATTRS = '_stylex_attrs'

const callStyleXAttrs = (s: MagicStringAST, setupOffset: number) =>
  importHelperFn(s, setupOffset, 'default', STYLEX_ATTRS, styleXAttrsId)

function transformDirective(
  s: MagicStringAST,
  setupOffset: number,
): NodeTransform {
  return (node) => {
    if (!(node.type === (1 satisfies NodeTypes.ELEMENT))) return
    const i = node.props.findIndex(
      (item) =>
        item.type === (7 satisfies NodeTypes.DIRECTIVE) &&
        item.rawName === 'v-stylex',
    )
    if (i === -1) return
    const directiveVStyleX = node.props[i] as DirectiveNode
    if (
      directiveVStyleX.exp?.type !== (4 satisfies NodeTypes.SIMPLE_EXPRESSION)
    )
      throw new Error('`v-stylex` must be passed a expression')

    const hasColon =
      directiveVStyleX.exp.content.startsWith('(') &&
      directiveVStyleX.exp.content.endsWith(')')
    const prefix = hasColon ? '' : '('
    const postfix = hasColon ? '' : ')'

    if (directiveVStyleX.exp.content.includes(STYLEX_PROPS)) {
      s?.overwrite(
        directiveVStyleX.loc.start.offset,
        directiveVStyleX.loc.end.offset,
        `v-bind="${callStyleXAttrs(s, setupOffset)}(${directiveVStyleX.exp.content})"`,
      )
      return
    }

    s?.overwrite(
      directiveVStyleX.loc.start.offset,
      directiveVStyleX.loc.end.offset,
      `v-bind="${callStyleXAttrs(s, setupOffset)}(${STYLEX_PROPS}${prefix}${directiveVStyleX.exp.content}${postfix})"`,
    )
  }
}

export function transformDefineStyleX(
  code: string,
  id: string,
): CodeTransform | undefined {
  if (!code.includes(DEFINE_STYLEX)) return
  const sfc = parseSFC(code, id)
  const { scriptSetup, getSetupAst, template } = sfc
  if (!scriptSetup || !template) return

  const setupOffset = scriptSetup.loc.start.offset

  const s = new MagicStringAST(code)
  const normalScript = addNormalScript(sfc, s)
  const scriptOffset = normalScript.start()

  const setupAST = getSetupAst()!

  walkAST<Node>(setupAST, {
    enter(node) {
      if (node.type !== 'VariableDeclaration') return
      const shouldChange = node.declarations.some((decl) =>
        isCallOf(decl.init, DEFINE_STYLEX),
      )
      if (!shouldChange) return

      node.declarations.forEach((decl) => {
        const isDefineStyleX = isCallOf(decl.init, DEFINE_STYLEX)
        if (isDefineStyleX) {
          s.overwriteNode((decl.init as CallExpression).callee, STYLEX_CREATE, {
            offset: setupOffset,
          })
        }
        const text = `\n${node.kind} ${s.sliceNode(decl, { offset: setupOffset })}`
        s.appendRight(
          isDefineStyleX ? scriptOffset : node.start! + setupOffset - 1,
          text,
        )
      })
      s.removeNode(node, { offset: setupOffset })
    },
  })

  if (scriptOffset !== undefined) normalScript.end()

  const ctx = createTransformContext(template.ast!, {
    nodeTransforms: [transformDirective(s, setupOffset)],
  })
  traverseNode(template.ast!, ctx)

  s.appendLeft(
    setupOffset,
    `\nimport { create as ${STYLEX_CREATE}, props as ${STYLEX_PROPS} } from '@stylexjs/stylex'`,
  )

  return generateTransform(s, id)
}
