import {
  DEFINE_SETUP_COMPONENT,
  MagicString,
  babelParse,
  getLang,
  getTransformResult,
} from '@vue-macros/common'
import { walk } from 'estree-walker'
import { normalizePath } from '@rollup/pluginutils'
import {
  SETUP_COMPONENT_ID_REGEX,
  SETUP_COMPONENT_ID_SUFFIX,
  SETUP_COMPONENT_SUB_MODULE,
} from './constants'
import type { HmrContext, ModuleNode } from 'vite'
import type { CallExpression, Function, Node } from '@babel/types'

export * from './constants'

interface NodeContext {
  code: string
  body: string
  node: CallExpression
}
export type SetupComponentContext = Record<string, NodeContext[]>

export const scanSetupComponent = (code: string, id: string) => {
  const program = babelParse(code, getLang(id))
  const nodes: CallExpression[] = []
  walk(program, {
    enter(node: Node) {
      if (
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        node.callee.name === DEFINE_SETUP_COMPONENT
      ) {
        nodes.push(node)
      }
    },
  })

  if (nodes.length === 0) return []

  // const s = new MagicString(code)
  const nodeContexts: NodeContext[] = nodes.map((node) => {
    if (
      !['FunctionExpression', 'ArrowFunctionExpression'].includes(
        node.arguments[0].type
      )
    )
      throw new SyntaxError(
        `${DEFINE_SETUP_COMPONENT}: Invalid setup component definition`
      )

    // const importName = `setupComponent_${i}`
    // s.overwrite(node.start!, node.end!, importName)
    // s.prepend(
    //   `import ${importName} from '${normalizedId}${SETUP_COMPONENT_ID_SUFFIX}${i}.vue'\n`
    // )
    const body: Node = (node.arguments[0] as Function).body
    let bodyStart = body.start!
    let bodyEnd = body.end!
    if (body.type === 'BlockStatement') {
      bodyStart++
      bodyEnd--
    }
    return {
      code: code.slice(node.start!, node.end!),
      body: code.slice(bodyStart, bodyEnd),
      node,
    }
  })
  return nodeContexts
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
  const code = `<script setup${lang ? ` lang="${lang}"` : ''}>
${body}
</script>`
  return code
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
