import {
  DEFINE_EMITS,
  DEFINE_PROPS,
  generateTransform,
  HELPER_PREFIX,
  importHelperFn,
  isCallOf,
  MagicStringAST,
  parseSFC,
  removeMacroImport,
  walkAST,
  WITH_DEFAULTS,
  type CodeTransform,
} from '@vue-macros/common'
import { useDefaultsId } from './helper'
import type * as t from '@babel/types'

const SIMPLE_PROPS = 'simpleProps'
const SIMPLE_EMITS = 'simpleEmits'

export function transformSimpleDefine(
  code: string,
  id: string,
): CodeTransform | undefined {
  if (!code.includes(SIMPLE_PROPS) && !code.includes(SIMPLE_EMITS)) return

  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const s = new MagicStringAST(code)
  const offset = scriptSetup.loc.start.offset
  const setupAst = getSetupAst()!

  walkAST(setupAst, {
    enter(node, parent) {
      if (removeMacroImport(node, s, offset)) return

      if (isCallOf(node, WITH_DEFAULTS)) {
        return processWithDefaults(node, parent!)
      }
      if (isCallOf(node, SIMPLE_PROPS) && !isCallOf(parent, WITH_DEFAULTS)) {
        return processSimpleProps(node)
      }

      if (isCallOf(node, SIMPLE_EMITS)) {
        return processSimpleEmits(node)
      }
    },
  })

  return generateTransform(s, id)

  function processSimpleProps(node: t.CallExpression) {
    if (!node.typeParameters)
      throw new SyntaxError(`${SIMPLE_PROPS} must have a type parameter.`)

    if (node.arguments.length === 0) {
      const useAttrs = importHelperFn(s, offset, 'useAttrs')
      s.overwriteNode(node, `${useAttrs}()`, { offset })
    } else {
      s.removeNode(node.typeParameters, { offset })
      s.overwriteNode(node.callee, DEFINE_PROPS, { offset })
    }
  }

  function processWithDefaults(node: t.CallExpression, parent: t.Node) {
    if (!isCallOf(node.arguments[0], SIMPLE_PROPS))
      throw new SyntaxError(
        `${WITH_DEFAULTS} must have a ${SIMPLE_PROPS} call as its first argument.`,
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
          true,
        )}(${HELPER_PREFIX}props, ${defaults})`,
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
