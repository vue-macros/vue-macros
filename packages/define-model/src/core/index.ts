import { extractIdentifiers, walkAST } from 'ast-walker-scope'
import {
  DEFINE_EMITS,
  DEFINE_MODEL,
  DEFINE_MODEL_DOLLAR,
  DEFINE_OPTIONS,
  DEFINE_PROPS,
  MagicString,
  REPO_ISSUE_URL,
  WITH_DEFAULTS,
  getTransformResult,
  isCallOf,
  parseSFC,
} from '@vue-macros/common'
import {
  DefinitionKind,
  analyzeSFC,
  getResolvedTypeCode,
  isTSExports,
  resolveTSProperties,
  resolveTSReferencedType,
  resolveTSScope,
} from '@vue-macros/api'
import { emitHelperId, useVmodelHelperId } from './helper'
import type { TSExports, TSProperties, TSResolvedType } from '@vue-macros/api'
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

export const transformDefineModel = async (
  code: string,
  id: string,
  version: 2 | 3,
  unified: boolean
) => {
  if (!code.includes(DEFINE_MODEL)) return

  let hasDefineModel = false
  let modelDecl: Node | undefined
  let modelDeclKind: string | undefined
  let modelTypeDecl: TSResolvedType | TSExports | undefined
  let modelIdentifier: string | undefined
  let modelDestructureDecl: ObjectPattern | undefined

  const modelIdentifiers = new Set<Identifier>()
  const modelVue2: { event: string; prop: string } = { prop: '', event: '' }
  let mode: 'reactivity-transform' | 'runtime' | undefined

  const s = new MagicString(code)
  const sfc = parseSFC(code, id)
  if (sfc.script || !sfc.scriptSetup) return
  const { scriptSetup } = sfc

  const offset = sfc.scriptSetup.loc.start.offset
  const { props: _props, emits, ast, file } = await analyzeSFC(s, sfc)

  const props =
    _props.kind === DefinitionKind.Empty
      ? await _props.getPlaceholder(DefinitionKind.TS)
      : _props

  // process <script setup>
  for (const node of ast) {
    if (node.type === 'ExpressionStatement') {
      // if (version === 2) {
      //   processDefineOptions(node.expression)
      // }

      if (
        (await processDefineModel(node.expression)) &&
        mode === 'reactivity-transform'
      )
        s.removeNode(node, { offset })
    } else if (node.type === 'VariableDeclaration' && !node.declare) {
      const total = node.declarations.length
      let left = total

      for (let i = 0; i < total; i++) {
        const decl = node.declarations[i]
        if (
          decl.init &&
          (await processDefineModel(decl.init, decl.id, node.kind)) &&
          mode === 'reactivity-transform'
        ) {
          if (left === 1) {
            s.removeNode(node, { offset })
          } else {
            let start = decl.start! + offset
            let end = decl.end! + offset
            if (i < total - 1) {
              // not the last one, locate the start of the next
              end = node.declarations[i + 1].start! + offset
            } else {
              // last one, locate the end of the prev
              start = node.declarations[i - 1].end! + offset
            }
            s.remove(start, end)
            left--
          }
        }
      }
    }
  }

  if (!modelTypeDecl || !hasDefineModel) return

  if (props && props.kind !== DefinitionKind.TS)
    throw new SyntaxError(
      `${
        props.kind !== DefinitionKind.TS ? DEFINE_PROPS : DEFINE_EMITS
      }() cannot accept non-type arguments when used with ${DEFINE_MODEL}()`
    )

  const definitions = await extractModelDefinitions(modelTypeDecl)

  const keys: string[] = []
  for (const [key, property] of Object.entries(definitions.properties)) {
    let resolved: TSResolvedType | undefined
    if (property.value) {
      const result = await resolveTSReferencedType(property.value)
      if (!isTSExports(result)) resolved = result
    }
    props.addProp(getPropKey(key), resolved, property.optional)
    emits?.addEmit(
      key,
      `(evt: ${JSON.stringify(getEventKey(key))}, value${
        resolved ? `: ${getResolvedTypeCode(resolved)}` : ''
      }): void`
    )
    keys.push(key)
  }

  if ('apply' in props) {
    props.apply()
  }

  if (mode === 'runtime') {
    rewriteRuntime()
  } else if (mode === 'reactivity-transform') rewriteAssignment()

  // for (const [key, methods] of Object.entries(definitions.methods)) {
  // for (const method of methods) {
  //   method.type
  //   props.addProp(key, resolved, property.optional)
  // }
  // if (property) {
  //   const value = property.value
  //   const { file } = resolveTSScope(value.scope)
  //   typeString = file.content.slice(value.type.start!, value.type.end!)
  // }
  // map[key] = type ? `${property.optional ? '?' : ''}: ${typeString}` : ''
  // }

  return getTransformResult(s, id)

  async function processDefineModel(
    node: Node,
    declId?: LVal,
    kind?: VariableDeclaration['kind']
  ) {
    if (isCallOf(node, DEFINE_MODEL)) mode = 'runtime'
    else if (isCallOf(node, DEFINE_MODEL_DOLLAR)) mode = 'reactivity-transform'
    else return false

    if (hasDefineModel) {
      throw new SyntaxError(`duplicate ${DEFINE_MODEL}() call`)
    }
    hasDefineModel = true
    modelDecl = node

    const modelTypeDeclRaw = node.typeParameters?.params[0]
    if (!modelTypeDeclRaw) {
      throw new SyntaxError(`expected a type parameter for ${DEFINE_MODEL}.`)
    }
    modelTypeDecl = await resolveTSReferencedType({
      scope: file,
      type: modelTypeDeclRaw,
    })
    if (!modelTypeDecl) {
      throw new SyntaxError(
        `type argument passed to ${DEFINE_MODEL}() cannot be resolved.`
      )
    }

    if (mode === 'reactivity-transform' && declId) {
      const ids = extractIdentifiers(declId)
      ids.forEach((id) => modelIdentifiers.add(id))

      if (declId.type === 'ObjectPattern') {
        modelDestructureDecl = declId
        for (const property of declId.properties) {
          if (property.type === 'RestElement') {
            throw new SyntaxError('rest element is not supported')
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

  function extractModelDefinitions(
    node: TSResolvedType | TSExports
  ): Promise<TSProperties> {
    if (isTSExports(node))
      throw new SyntaxError(`${DEFINE_MODEL}: cannot resolve TS definition.`)

    const { type, scope } = node
    if (
      type.type !== 'TSInterfaceDeclaration' &&
      type.type !== 'TSTypeLiteral' &&
      type.type !== 'TSIntersectionType'
    )
      throw new SyntaxError(`${DEFINE_MODEL}: cannot resolve TS definition.`)

    return resolveTSProperties({
      scope,
      type,
    })
  }

  function rewriteRuntime() {
    s.prependLeft(offset, `\nimport _DM_useVModel from '${useVmodelHelperId}';`)

    const text = `_DM_useVModel(${keys
      .map((n) => {
        if (n === getPropKey(n) && getEventKey(n) === `update:${n}`) {
          return JSON.stringify(n)
        }
        return `[${JSON.stringify(n)}, ${
          n !== getPropKey(n) ? JSON.stringify(getPropKey(n)) : 'null'
        }, ${
          getEventKey(n) !== `update:${n}`
            ? JSON.stringify(getEventKey(n))
            : 'null'
        }]`
      })
      .join(', ')})`
    s.overwriteNode(modelDecl!, text, { offset })
  }

  function rewriteAssignment() {
    if (!emits?.declId)
      throw new Error(
        `Identifier of returning value of ${DEFINE_EMITS} is not found, please report this issue.\n${REPO_ISSUE_URL}`
      )

    let hasTransfromed = false

    function overwrite(
      node: Node,
      id: Identifier,
      value: string,
      original = false
    ) {
      hasTransfromed = true
      const content = `_DM_emitHelper(${
        (s.sliceNode(emits!.declId!), { offset })
      }, ${JSON.stringify(getEventKey(id.name))}, ${value}${
        original ? `, ${id.name}` : ''
      })`
      s.overwriteNode(node, content, { offset })
    }

    walkAST(ast, {
      leave(node) {
        if (node.type === 'AssignmentExpression') {
          if (node.left.type !== 'Identifier') return
          const id = this.scope[node.left.name] as Identifier
          if (!modelIdentifiers.has(id)) return

          const left = s.sliceNode(node.left, { offset })
          let right = s.sliceNode(node.right, { offset })
          if (node.operator !== '=') {
            right = `${left} ${node.operator.replace(/=$/, '')} ${right}`
          }

          overwrite(node, id, right)
        } else if (node.type === 'UpdateExpression') {
          if (node.argument.type !== 'Identifier') return
          const id = this.scope[node.argument.name] as Identifier
          if (!modelIdentifiers.has(id)) return

          let value = node.argument.name
          if (node.operator === '++') value += ' + 1'
          else value += ' - 1'

          overwrite(node, id, value, !node.prefix)
        }
      },
    })

    if (hasTransfromed) {
      s.prependLeft(offset, `\nimport _DM_emitHelper from '${emitHelperId}';`)
    }
  }

  function getPropKey(key: string) {
    if (unified && version === 2 && key === 'modelValue') {
      return 'value'
    }
    return key
  }

  function getEventKey(key: string) {
    if (version === 2) {
      if (modelVue2.prop === key) {
        return modelVue2.event
      } else if (key === 'value' || (unified && key === 'modelValue')) {
        return 'input'
      }
    }
    return `update:${key}`
  }
}
