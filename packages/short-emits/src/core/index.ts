import {
  MagicString,
  getTransformResult,
  isTs,
  parseSFC,
  resolveObjectKey,
  walkAST,
} from '@vue-macros/common'
import type {
  Identifier,
  Node,
  RestElement,
  TSMethodSignature,
  TSPropertySignature,
  TSType,
  TSTypeReference,
} from '@babel/types'

export function transformShortEmits(code: string, id: string) {
  if (!code.includes('SE') && !code.includes('ShortEmits')) return

  const sfc = parseSFC(code, id)
  const { scriptSetup, lang, getSetupAst } = sfc
  if (!scriptSetup || !isTs(lang)) return

  const offset = scriptSetup.loc.start.offset
  const ast = getSetupAst()!

  const nodes: {
    def: TSType
    type: TSTypeReference
  }[] = []

  walkAST<Node>(ast, {
    enter(node) {
      if (
        node.type === 'TSTypeReference' &&
        node.typeName.type === 'Identifier' &&
        ['SE', 'ShortEmits'].includes(node.typeName.name) &&
        node.typeParameters?.params[0].type
      ) {
        nodes.push({
          def: node.typeParameters.params[0],
          type: node,
        })
      }
    },
  })

  const s = new MagicString(code)

  function stringifyParams(params: Array<Identifier | RestElement>) {
    return params.length > 0 ? s.sliceNodes(params, { offset }) : ''
  }

  for (const { def, type } of nodes) {
    if (def.type !== 'TSTypeLiteral')
      throw new SyntaxError(
        `accepts object literal only: ${s.sliceNode(def, { offset })}`
      )

    // remove SE<...>
    s.remove(offset + type.start!, offset + def.start!)
    s.remove(offset + def.end!, offset + type.end!)

    for (const _member of def.members) {
      if (!['TSPropertySignature', 'TSMethodSignature'].includes(_member.type))
        throw new SyntaxError(
          `accepts method and property only: ${s.sliceNode(_member, {
            offset,
          })}`
        )

      const member = _member as TSPropertySignature | TSMethodSignature

      const key = resolveObjectKey(member.key, member.computed)
      let params = ''

      switch (member.type) {
        case 'TSPropertySignature': {
          if (
            !member.typeAnnotation ||
            !['TSTupleType', 'TSFunctionType'].includes(
              member.typeAnnotation.typeAnnotation.type
            )
          )
            throw new SyntaxError(
              `not supported: ${s.sliceNode(member, { offset })}`
            )

          switch (member.typeAnnotation.typeAnnotation.type) {
            case 'TSTupleType':
              params = `...args: ${s.sliceNode(
                member.typeAnnotation.typeAnnotation,
                { offset }
              )}`
              break
            case 'TSFunctionType':
              params = stringifyParams(
                member.typeAnnotation.typeAnnotation.parameters
              )
              break
          }
          break
        }

        case 'TSMethodSignature': {
          params = stringifyParams(member.parameters)
          break
        }
      }

      s.overwriteNode(
        member,
        `(evt: ${key}${params ? `, ${params}` : ''}): void`,
        { offset }
      )
    }
  }

  return getTransformResult(s, id)
}
