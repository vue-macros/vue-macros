import { compileScript } from '@vue/compiler-sfc'
import MagicString from 'magic-string'
import { DEFINE_MODEL } from './constants'
import { isCallOf, parseSFC } from './utils'
import type {
  Node,
  Statement,
  TSInterfaceBody,
  TSTypeLiteral,
} from '@babel/types'

export const transform = (code: string, filename: string) => {
  let hasDefineModelCall = false
  let propsTypeDecl: TSInterfaceBody | TSTypeLiteral | undefined

  function processDefineModel(node: Node) {
    if (!isCallOf(node, DEFINE_MODEL)) {
      return false
    }

    if (hasDefineModelCall) {
      throw new SyntaxError(`duplicate ${DEFINE_MODEL}() call`)
    }
    hasDefineModelCall = true

    const propsTypeDeclRaw = node.typeParameters?.params[0]
    if (!propsTypeDeclRaw) {
      throw new SyntaxError('Error: 1')
    }
    propsTypeDecl = resolveQualifiedType(
      propsTypeDeclRaw,
      (node) => node.type === 'TSTypeLiteral'
    ) as TSTypeLiteral | TSInterfaceBody | undefined

    if (!propsTypeDecl) {
      throw new Error(
        `type argument passed to ${DEFINE_MODEL}() must be a literal type, ` +
          `or a reference to an interface or literal type.`
      )
    }
  }

  function resolveQualifiedType(
    node: Node,
    qualifier: (node: Node) => boolean
  ) {
    if (qualifier(node)) {
      return node
    }
    if (
      node.type === 'TSTypeReference' &&
      node.typeName.type === 'Identifier'
    ) {
      const refName = node.typeName.name
      const isQualifiedType = (node: Node): Node | undefined => {
        if (
          node.type === 'TSInterfaceDeclaration' &&
          node.id.name === refName
        ) {
          return node.body
        } else if (
          node.type === 'TSTypeAliasDeclaration' &&
          node.id.name === refName &&
          qualifier(node.typeAnnotation)
        ) {
          return node.typeAnnotation
        } else if (node.type === 'ExportNamedDeclaration' && node.declaration) {
          return isQualifiedType(node.declaration)
        }
      }
      const body = sfc.scriptSetup!.scriptSetupAst!
      for (const node of body) {
        const qualified = isQualifiedType(node)
        if (qualified) {
          return qualified
        }
      }
    }
  }

  if (!code.includes(DEFINE_MODEL)) return

  const sfc = parseSFC(code, filename)
  if (!sfc.scriptSetup) return

  if (!sfc.scriptSetup.scriptSetupAst) {
    sfc.scriptSetup = compileScript(sfc, {
      id: filename,
    })
  }
  const { scriptSetup } = sfc
  const startOffset = scriptSetup.loc.start.offset
  // const endOffset = scriptSetup.loc.end.offset

  const s = new MagicString(code)

  for (const node of scriptSetup.scriptSetupAst as Statement[]) {
    if (node.type === 'VariableDeclaration' && !node.declare) {
      const total = node.declarations.length
      let left = total

      for (let i = 0; i < total; i++) {
        const decl = node.declarations[i]
        if (decl.init) {
          processDefineModel(decl.init)

          if (hasDefineModelCall) {
            if (left === 1) {
              s.remove(node.start! + startOffset, node.end! + startOffset)
            } else {
              let start = decl.start! + startOffset
              let end = decl.end! + startOffset
              if (i < total - 1) {
                // not the last one, locate the start of the next
                end = node.declarations[i + 1].start! + startOffset
              } else {
                // last one, locate the end of the prev
                start = node.declarations[i - 1].end! + startOffset
              }
              s.remove(start, end)
              left--
            }
          }
        }
      }
    }
  }

  if (!propsTypeDecl) return

  if (propsTypeDecl.type !== 'TSTypeLiteral') {
    throw new SyntaxError(
      `type argument passed to ${DEFINE_MODEL}() must be a literal type, or a reference to an interface or literal type.`
    )
  }

  const map: Record<string, string> = {}
  for (const member of propsTypeDecl.members) {
    if (
      member.type !== 'TSPropertySignature' ||
      member.key.type !== 'Identifier' ||
      !member.typeAnnotation?.typeAnnotation
    ) {
      throw new SyntaxError(
        `type argument passed to ${DEFINE_MODEL}() must be a literal type, or a reference to an interface or literal type.`
      )
    }

    const value = scriptSetup.loc.source.slice(
      member.typeAnnotation.typeAnnotation.start!,
      member.typeAnnotation.typeAnnotation.end!
    )

    map[member.key.name] = value
  }

  const str = `
  const props = defineProps<{
    ${Object.entries(map)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')}
  }>()

  const emit = defineEmits<{
    ${Object.entries(map)
      .map(([key, value]) => `(evt: 'update:${key}', value: ${value}): void`)
      .join('\n')}
  }>()`

  s.prependLeft(scriptSetup.loc.start.offset, str)

  return {
    code: s.toString(),
    get map() {
      return s.generateMap()
    },
  }
}
