import {
  DEFINE_EMITS,
  MagicString,
  generateTransform,
  isCallOf,
  isTs,
  isTypeOf,
  parseSFC,
  resolveObjectKey,
  walkAST,
} from '@vue-macros/common'
import {
  type Identifier,
  type Node,
  type RestElement,
  type TSType,
} from '@babel/types'

export function transformShortEmits(code: string, id: string) {
  const sfc = parseSFC(code, id)
  const { scriptSetup, lang, getSetupAst } = sfc
  if (!scriptSetup || !isTs(lang)) return

  const offset = scriptSetup.loc.start.offset
  const ast = getSetupAst()!

  const params: TSType[] = []
  const s = new MagicString(code)

  walkAST<Node>(ast, {
    enter(node) {
      if (isCallOf(node, DEFINE_EMITS) && node.typeParameters?.params?.[0]) {
        let param = node.typeParameters?.params?.[0]

        if (
          param.type === 'TSTypeReference' &&
          param.typeName.type === 'Identifier' &&
          ['SE', 'ShortEmits'].includes(param.typeName.name) &&
          param.typeParameters?.params[0]
        ) {
          const inner = param.typeParameters?.params[0]

          // remove SE<...>
          s.remove(offset + param.start!, offset + inner.start!)
          s.remove(offset + inner.end!, offset + param.end!)

          param = inner
        }

        params.push(param)
      }
    },
  })

  for (const param of params) {
    if (param.type !== 'TSTypeLiteral') continue

    for (const member of param.members) {
      if (!isTypeOf(member, ['TSPropertySignature', 'TSMethodSignature']))
        continue

      const key = resolveObjectKey(member, true)
      let params = ''

      switch (member.type) {
        case 'TSPropertySignature': {
          if (
            !member.typeAnnotation ||
            !isTypeOf(member.typeAnnotation.typeAnnotation, [
              'TSTupleType',
              'TSFunctionType',
            ])
          )
            continue

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

  return generateTransform(s, id)

  function stringifyParams(params: Array<Identifier | RestElement>) {
    return params.length > 0 ? s.sliceNode(params, { offset }) : ''
  }
}
