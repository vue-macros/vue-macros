import path from 'node:path'
import {
  DEFINE_SETUP_COMPONENT,
  MagicString,
  babelParse,
  getTransformResult,
} from '@vue-macros/common'
import { walk } from 'estree-walker'
import { normalizePath } from '@rollup/pluginutils'
import { SETUP_COMPONENT_ID_PREFIX } from './constants'
import type { CallExpression, Function, Node } from '@babel/types'

export * from './constants'

interface NodeContext {
  code: string
  body: string
  node: CallExpression
}
export type SetupComponentContext = Record<string, NodeContext[]>

export const transformSetupComponent = (
  code: string,
  id: string,
  ctx: SetupComponentContext
) => {
  const normalizedId = normalizePath(id)
  const program = babelParse(code, path.extname(id).replace(/^\./, ''))
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

  if (nodes.length === 0) return

  const s = new MagicString(code)
  const nodeContexts: NodeContext[] = nodes.map((node, i) => {
    if (
      !['FunctionExpression', 'ArrowFunctionExpression'].includes(
        node.arguments[0].type
      )
    )
      throw new SyntaxError(
        `${DEFINE_SETUP_COMPONENT}: Invalid setup component definition`
      )

    const importName = `setupComponent_${i}`
    s.overwrite(node.start!, node.end!, importName)
    s.prepend(
      `import ${importName} from '${SETUP_COMPONENT_ID_PREFIX}${normalizedId}/${i}.vue'\n`
    )
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
  ctx[normalizedId] = nodeContexts

  return getTransformResult(s, id)
}

export const loadSetupComponent = (id: string, ctx: SetupComponentContext) => {
  const { dir: file, name: i } = path.parse(
    id.replace(SETUP_COMPONENT_ID_PREFIX, '')
  )
  const index = +i
  if (!ctx[file]?.[index]) return

  const { body } = ctx[file][index]
  const lang = path.extname(file).replace(/^\./, '')
  const code = `<script setup${lang ? ` lang="${lang}"` : ''}>
${body}
</script>`
  return code
}
