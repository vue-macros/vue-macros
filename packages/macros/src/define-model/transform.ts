import { compileScript } from '@vue/compiler-sfc'
import MagicString from 'magic-string'
import { extractIdentifiers, walkAST } from 'ast-walker-scope'
import {
  DEFINE_EMITS,
  DEFINE_MODEL,
  DEFINE_OPTIONS,
  DEFINE_PROPS,
  isCallOf,
  parseSFC,
} from '@vue-macros/common'
import type {
  Identifier,
  LVal,
  Node,
  ObjectExpression,
  ObjectPattern,
  ObjectProperty,
  Program,
  Statement,
  TSInterfaceBody,
  TSTypeLiteral,
  VariableDeclaration,
} from '@babel/types'

export const transformDefineModel = (
  code: string,
  filename: string,
  version: 2 | 3
) => {
  let hasDefineProps = false
  let hasDefineEmits = false
  let hasDefineModel = false
  let propsTypeDecl: TSInterfaceBody | TSTypeLiteral | undefined
  let propsDestructureDecl: Node | undefined
  let emitsTypeDecl: TSInterfaceBody | TSTypeLiteral | undefined
  let emitsIdentifier: string | undefined
  let modelTypeDecl: TSInterfaceBody | TSTypeLiteral | undefined
  let modelIdentifier: string | undefined
  let modelDeclKind: string | undefined
  let modelDestructureDecl: ObjectPattern | undefined
  const modelIdentifiers = new Set<Identifier>()
  const modelVue2: { event: string; prop: string } = { prop: '', event: '' }

  function processDefinePropsOrEmits(node: Node, declId?: LVal) {
    let type: 'props' | 'emits'
    if (isCallOf(node, DEFINE_PROPS)) {
      type = 'props'
    } else if (isCallOf(node, DEFINE_EMITS)) {
      type = 'emits'
    } else {
      return false
    }
    const fnName = type === 'props' ? DEFINE_PROPS : DEFINE_EMITS

    if (type === 'props') hasDefineProps = true
    else hasDefineEmits = true

    if (node.arguments[0])
      throw new SyntaxError(
        `Error: ${fnName}() cannot accept non-type arguments when used with ${DEFINE_MODEL}()`
      )

    const typeDeclRaw = node.typeParameters?.params?.[0]
    if (!typeDeclRaw)
      throw new SyntaxError(
        `Error: ${fnName}() expected a type parameter when used with ${DEFINE_MODEL}.`
      )

    const typeDecl = resolveQualifiedType(
      typeDeclRaw,
      (node) => node.type === 'TSTypeLiteral'
    ) as TSTypeLiteral | TSInterfaceBody | undefined

    if (!typeDecl) {
      throw new Error(
        `type argument passed to ${fnName}() must be a literal type, ` +
          `or a reference to an interface or literal type.`
      )
    }

    if (type === 'props') propsTypeDecl = typeDecl
    else emitsTypeDecl = typeDecl

    if (declId) {
      if (type === 'props' && declId.type === 'ObjectPattern') {
        propsDestructureDecl = declId
      } else if (type === 'emits' && declId.type === 'Identifier') {
        emitsIdentifier = declId.name
      }
    } else if (type === 'emits') {
      emitsIdentifier = `_${DEFINE_MODEL}_emit`
      s.prependRight(startOffset + node.start!, `const ${emitsIdentifier} = `)
    }

    return true
  }

  function processDefineModel(
    node: Node,
    declId?: LVal,
    kind?: VariableDeclaration['kind']
  ) {
    if (!isCallOf(node, DEFINE_MODEL)) {
      return false
    }

    if (hasDefineModel) {
      throw new SyntaxError(`duplicate ${DEFINE_MODEL}() call`)
    }
    hasDefineModel = true

    const propsTypeDeclRaw = node.typeParameters?.params[0]
    if (!propsTypeDeclRaw) {
      throw new SyntaxError('Error: 1')
    }
    modelTypeDecl = resolveQualifiedType(
      propsTypeDeclRaw,
      (node) => node.type === 'TSTypeLiteral'
    ) as TSTypeLiteral | TSInterfaceBody | undefined

    if (!modelTypeDecl) {
      throw new Error(
        `type argument passed to ${DEFINE_MODEL}() must be a literal type, ` +
          `or a reference to an interface or literal type.`
      )
    }

    if (declId) {
      const ids = extractIdentifiers(declId)
      ids.forEach((id) => modelIdentifiers.add(id))

      if (declId.type === 'ObjectPattern') {
        modelDestructureDecl = declId
        for (const property of declId.properties) {
          if (property.type === 'RestElement') {
            throw new SyntaxError('not supported')
          }
        }
      } else {
        modelIdentifier = scriptSetup.loc.source.slice(
          declId.start!,
          declId.end!
        )
      }
    }
    if (kind) modelDeclKind = kind

    return true
  }

  function processDefineOptions(node: Node) {
    if (isCallOf(node, DEFINE_OPTIONS)) {
      node.arguments.forEach((item) => processVue2Model(item))
    }
  }

  function processVue2Model(node: Node) {
    // model: {
    //   prop: 'checked',
    //   event: 'change'
    // }
    if (node.type === 'ObjectExpression') {
      const model = node.properties.find(
        (prop) =>
          prop.type === 'ObjectProperty' &&
          prop.key.type === 'Identifier' &&
          prop.key.name === 'model' &&
          prop.value.type === 'ObjectExpression' &&
          prop.value.properties.length === 2
      ) as ObjectProperty

      if (!model) return false
      ;(model.value as ObjectExpression).properties.forEach((propertyItem) => {
        if (
          propertyItem.type === 'ObjectProperty' &&
          propertyItem.key.type === 'Identifier' &&
          propertyItem.value.type === 'StringLiteral' &&
          ['prop', 'event'].includes(propertyItem.key.name)
        ) {
          const key = propertyItem.key.name as 'prop' | 'event'
          modelVue2[key] = propertyItem.value.value
        }
      })
      return true
    }
    return false
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

  function extractRuntimeProps(
    node: TSTypeLiteral | TSInterfaceBody
  ): Record<string, string> {
    const members = node.type === 'TSTypeLiteral' ? node.members : node.body
    const map: Record<string, string> = {}
    for (const m of members) {
      if (
        (m.type === 'TSPropertySignature' || m.type === 'TSMethodSignature') &&
        m.key.type === 'Identifier'
      ) {
        const value = scriptSetup.loc.source.slice(
          m.typeAnnotation!.start!,
          m.typeAnnotation!.end!
        )
        map[m.key.name] = value
      }
    }
    return map
  }

  function getEventKey(key: string) {
    if (version === 2) {
      if (modelVue2.prop === key) {
        return modelVue2.event
      } else if (key === 'value') {
        return 'input'
      }
    }
    return `update:${key}`
  }

  function processEmitValue() {
    if (!emitsIdentifier) throw new Error('Error: 4')

    const program: Program = {
      type: 'Program',
      body: scriptSetup.scriptSetupAst as Statement[],
      directives: [],
      sourceType: 'module',
      sourceFile: '',
    }
    let hasTransfromed = false
    walkAST(program, {
      leave(node) {
        if (node.type !== 'AssignmentExpression') return
        if (node.left.type !== 'Identifier') return

        const idDecl = this.scope[node.left.name] as Identifier
        if (!modelIdentifiers.has(idDecl)) return

        hasTransfromed = true
        s.overwrite(
          startOffset + node.start!,
          startOffset + node.end!,
          `__emitHelper(${emitsIdentifier}, '${getEventKey(
            idDecl.name
          )}', ${s.slice(
            startOffset + node.right.start!,
            startOffset + node.right.end!
          )})`
        )
      },
    })

    if (hasTransfromed) {
      s.prependLeft(
        startOffset,
        "import { emitHelper as __emitHelper } from 'unplugin-vue-macros/helper'\n"
      )
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

  if (
    version === 2 &&
    scriptSetup.scriptAst &&
    scriptSetup.scriptAst.length > 0
  ) {
    // process normal <script>
    for (const node of scriptSetup.scriptAst as Statement[]) {
      if (node.type === 'ExportDefaultDeclaration') {
        const { declaration } = node
        if (declaration.type === 'ObjectExpression') {
          processVue2Model(declaration)
        } else if (
          declaration.type === 'CallExpression' &&
          declaration.callee.type === 'Identifier' &&
          declaration.callee.name === 'defineComponent'
        ) {
          declaration.arguments.forEach((arg) => {
            if (arg.type === 'ObjectExpression') {
              processVue2Model(arg)
            }
          })
        }
      }
    }
  }

  // process <script setup>
  for (const node of scriptSetup.scriptSetupAst as Statement[]) {
    if (node.type === 'ExpressionStatement') {
      processDefinePropsOrEmits(node.expression)

      if (version === 2) {
        processDefineOptions(node.expression)
      }

      if (processDefineModel(node.expression)) {
        s.remove(node.start! + startOffset, node.end! + startOffset)
      }
    } else if (node.type === 'VariableDeclaration' && !node.declare) {
      const total = node.declarations.length
      let left = total

      for (let i = 0; i < total; i++) {
        const decl = node.declarations[i]
        if (decl.init) {
          processDefinePropsOrEmits(decl.init, decl.id)

          if (processDefineModel(decl.init, decl.id, node.kind)) {
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

  if (!modelTypeDecl) return
  if (modelTypeDecl.type !== 'TSTypeLiteral') {
    throw new SyntaxError(
      `type argument passed to ${DEFINE_MODEL}() must be a literal type, or a reference to an interface or literal type.`
    )
  }

  const map = extractRuntimeProps(modelTypeDecl)

  const propsText = Object.entries(map)
    .map(([key, value]) => `${key}${value}`)
    .join('\n')

  const emitsText = Object.entries(map)
    .map(([key, value]) => `(evt: '${getEventKey(key)}', value${value}): void`)
    .join('\n')

  if (hasDefineProps) {
    s.appendLeft(startOffset + propsTypeDecl!.start! + 1, `${propsText}\n`)
    if (propsDestructureDecl && modelDestructureDecl)
      for (const property of modelDestructureDecl.properties) {
        const text = code.slice(
          startOffset + property.start!,
          startOffset + property.end!
        )
        s.appendLeft(startOffset + propsDestructureDecl.start! + 1, `${text}, `)
      }
  } else {
    let text = ''
    const kind = modelDeclKind || 'let'
    if (modelIdentifier) {
      text = modelIdentifier
    } else if (modelDestructureDecl) {
      text = code.slice(
        startOffset + modelDestructureDecl.start!,
        startOffset + modelDestructureDecl.end!
      )
    }

    s.appendLeft(
      startOffset,
      `${text ? `${kind} ${text} = ` : ''}defineProps<{
  ${propsText}
}>();\n`
    )
  }
  if (hasDefineEmits) {
    s.appendLeft(startOffset + emitsTypeDecl!.start! + 1, `${emitsText}\n`)
  } else {
    emitsIdentifier = `_${DEFINE_MODEL}_emit`
    s.appendLeft(
      startOffset,
      `const ${emitsIdentifier} = defineEmits<{
  ${emitsText}
}>();\n`
    )
  }

  if (hasDefineModel) {
    processEmitValue()
  }

  return s
}
