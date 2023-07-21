import {
  DEFINE_EMITS,
  DEFINE_PROPS,
  HELPER_PREFIX,
  MagicString,
  WITH_DEFAULTS,
  getTransformResult,
  importHelperFn,
  isCallOf,
  parseSFC,
  removeMacroImport,
  walkASTSetup,
} from '@vue-macros/common'
import { type NodeTransform } from '@vue/compiler-core'
import { useDefaultsId } from './helper'
import type * as t from '@babel/types'

const SIMPLE_PROPS = 'simpleProps'
const SIMPLE_EMITS = 'simpleEmits'

export async function transformSimpleDefine(code: string, id: string) {
  if (!code.includes(SIMPLE_PROPS) && !code.includes(SIMPLE_EMITS)) return

  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const s = new MagicString(code)
  const offset = scriptSetup.loc.start.offset
  const setupAst = getSetupAst()!

  await walkASTSetup(setupAst, (setup) => {
    setup.onEnter((node) => {
      removeMacroImport(node, s, offset)
    })

    setup.onEnter(
      (node): node is t.CallExpression => isCallOf(node, WITH_DEFAULTS),
      (node, parent) => processWithDefaults(node, parent)
    )

    setup.onEnter(
      (node, parent): node is t.CallExpression =>
        isCallOf(node, SIMPLE_PROPS) && !isCallOf(parent, WITH_DEFAULTS),
      (node) => processSimpleProps(node)
    )

    setup.onEnter(
      (node): node is t.CallExpression => isCallOf(node, SIMPLE_EMITS),
      (node) => processSimpleEmits(node)
    )
  })

  return getTransformResult(s, id)

  function processSimpleProps(node: t.CallExpression) {
    if (!node.typeParameters)
      throw new SyntaxError(`${SIMPLE_PROPS} must have a type parameter.`)

    s.removeNode(node.typeParameters, { offset })
    s.overwriteNode(node.callee, DEFINE_PROPS, { offset })
  }

  function processWithDefaults(
    node: t.CallExpression,
    parent: t.ParentMaps['CallExpression']
  ) {
    if (!isCallOf(node.arguments[0], SIMPLE_PROPS))
      throw new SyntaxError(
        `${WITH_DEFAULTS} must have a ${SIMPLE_PROPS} call as its first argument.`
      )

    const defaults = s.sliceNode(node.arguments[1], { offset })
    s.remove(offset + node.start!, offset + node.arguments[0].start!)
    s.remove(offset + node.arguments[0].end!, offset + node.end!)

    // rename props
    if (
      parent?.type === 'VariableDeclarator' &&
      parent.id.type === 'Identifier'
    ) {
      s.overwriteNode(parent.id, `${HELPER_PREFIX}props`, { offset })
      s.prependLeft(
        offset,
        `const ${parent.id.name} = ${importHelperFn(
          s,
          offset,
          'useDefaults',
          useDefaultsId,
          true
        )}(${HELPER_PREFIX}props, ${defaults})`
      )
    }

    processSimpleProps(node.arguments[0])
  }

  function processSimpleEmits(node: t.CallExpression) {
    if (!node.typeParameters)
      throw new SyntaxError(`${SIMPLE_EMITS} must have a type parameter.`)

    s.removeNode(node.typeParameters, { offset })
    s.overwriteNode(node.callee, DEFINE_EMITS, { offset })
  }
}

export function transformSimpleDefineTemplate(): NodeTransform {
  return (node) => {
    if (node.type !== 1) return
    for (const [i, prop] of node.props.entries()) {
      if (prop.type !== 6 || prop.value !== undefined) continue
      node.props[i] = {
        type: 7 /* NodeTypes.DIRECTIVE */,
        name: 'bind',
        arg: {
          type: 4 /* NodeTypes.SIMPLE_EXPRESSION */,
          constType: 3 /* ConstantTypes.CAN_STRINGIFY */,
          content: 'checked',
          isStatic: true,
          loc: prop.loc,
        },
        exp: {
          type: 4 /* NodeTypes.SIMPLE_EXPRESSION */,
          constType: 3 /* ConstantTypes.CAN_STRINGIFY */,
          content: 'true',
          isStatic: false,
          loc: prop.loc,
        },
        loc: prop.loc,
        modifiers: [],
      }
    }
  }
}
