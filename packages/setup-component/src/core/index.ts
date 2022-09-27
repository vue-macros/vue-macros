import {
  DEFINE_SETUP_COMPONENT,
  MagicString,
  babelParse,
  getLang,
  getTransformResult,
  isCallOf,
} from '@vue-macros/common'
import { walk } from 'estree-walker'
import { normalizePath } from '@rollup/pluginutils'
import {
  SETUP_COMPONENT_ID_REGEX,
  SETUP_COMPONENT_ID_SUFFIX,
  SETUP_COMPONENT_SUB_MODULE,
  SETUP_COMPONENT_TYPE,
} from './constants'
import type { HmrContext, ModuleNode } from 'vite'
import type { Function, Node } from '@babel/types'

export * from './constants'

// TODO SWC

interface NodeContext {
  code: string
  body: string
  node: Node
}
export type SetupComponentContext = Record<string, NodeContext[]>

export const scanSetupComponent = (code: string, id: string) => {
  const program = babelParse(code, getLang(id))
  const nodes: { fn: Node; src?: Node }[] = []
  walk(program, {
    enter(node: Node) {
      if (isCallOf(node, DEFINE_SETUP_COMPONENT)) {
        nodes.push({ fn: node.arguments[0], src: node })
      } else if (
        node.type === 'VariableDeclarator' &&
        node.id.type === 'Identifier' &&
        node.id.typeAnnotation?.type === 'TSTypeAnnotation' &&
        node.id.typeAnnotation.typeAnnotation.type === 'TSTypeReference' &&
        node.id.typeAnnotation.typeAnnotation.typeName.type === 'Identifier' &&
        node.id.typeAnnotation.typeAnnotation.typeName.name ===
          SETUP_COMPONENT_TYPE &&
        node.init
      ) {
        nodes.push({ fn: node.init })
      }
    },
  })

  if (nodes.length === 0) return []

  return nodes.map(({ fn, src }): NodeContext => {
    if (!['FunctionExpression', 'ArrowFunctionExpression'].includes(fn.type))
      throw new SyntaxError(
        `${DEFINE_SETUP_COMPONENT}: invalid setup component definition`
      )

    const body: Node = (fn as Function).body
    let bodyStart = body.start!
    let bodyEnd = body.end!
    if (body.type === 'BlockStatement') {
      bodyStart++
      bodyEnd--
    }
    return {
      code: code.slice(fn.start!, fn.end!),
      body: code.slice(bodyStart, bodyEnd),
      node: src || fn,
    }
  })
}

export const transformSetupComponent = (
  code: string,
  id: string,
  ctx: SetupComponentContext
) => {
  const normalizedId = normalizePath(id)
  const s = new MagicString(code)

  const nodeContexts = scanSetupComponent(code, id)
  ctx[normalizedId] = nodeContexts

  for (const [i, { node }] of nodeContexts.entries()) {
    const importName = `setupComponent_${i}`
    s.overwrite(node.start!, node.end!, importName)
    s.prepend(
      `import ${importName} from '${normalizedId}${SETUP_COMPONENT_ID_SUFFIX}${i}.vue'\n`
    )
  }

  return getTransformResult(s, id)
}

export const loadSetupComponent = (
  virtualId: string,
  ctx: SetupComponentContext,
  root: string
) => {
  const index = +(SETUP_COMPONENT_ID_REGEX.exec(virtualId)?.[1] ?? -1)
  const id = virtualId.replace(SETUP_COMPONENT_ID_REGEX, '')
  const nodeCtx = ctx[id]?.[index] || ctx[root + id]?.[index]
  if (!nodeCtx) return

  const { body } = nodeCtx
  const lang = getLang(id)

  const program = babelParse(body, lang, { allowReturnOutsideFunction: true })
  const s = new MagicString(body)
  for (const stmt of program.body) {
    // transform return
    if (stmt.type !== 'ReturnStatement' || !stmt.argument) continue
    s.overwriteNode(stmt, `defineRender(${s.sliceNode(stmt.argument)});`)
  }

  s.prepend(`<script setup${lang ? ` lang="${lang}"` : ''}>`)
  s.append(`</script>`)

  return s.toString()
}

export const hotUpdateSetupComponent = async (
  { file, modules, read }: HmrContext,
  ctx: SetupComponentContext
) => {
  const isSubModule = (id: string) => SETUP_COMPONENT_SUB_MODULE.test(id)
  const getSubModule = (module: ModuleNode): ModuleNode[] => {
    const importedModules = Array.from(module.importedModules)
    if (importedModules.length === 0) return []

    return importedModules
      .filter(({ id }) => id && isSubModule(id!))
      .flatMap((module) => {
        return [module, ...getSubModule(module)]
      })
  }

  const module = modules.find((mod) => mod.file === file)
  if (!module || !module.id) return

  const affectedModules = getSubModule(module)

  const normalizedId = normalizePath(file)
  const nodeContexts = scanSetupComponent(await read(), normalizedId)
  ctx[normalizedId] = nodeContexts

  return [...modules, ...affectedModules]
}
