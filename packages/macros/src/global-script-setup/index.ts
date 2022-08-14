import path from 'node:path'
import {
  DEFINE_SETUP_COMPONENT,
  MagicString,
  babelParse,
  getTransformResult,
} from '@vue-macros/common'
import { walk } from 'estree-walker'
import { GLOBAL_SCRIPT_SETUP_ID_PREFIX } from './constants'
import type { CallExpression, Function, Node } from '@babel/types'

export * from './constants'

interface NodeContext {
  code: string
  body: string
  node: CallExpression
}
export type GlobalScriptSetupContext = Record<string, NodeContext[]>

export const transformGlobalScriptSetup = (
  code: string,
  id: string,
  ctx: GlobalScriptSetupContext
) => {
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
      `import ${importName} from '${GLOBAL_SCRIPT_SETUP_ID_PREFIX}${id}:${i}.vue'\n`
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
  ctx[id] = nodeContexts

  return getTransformResult(s, id)
}

export const loadGlobalScriptSetup = (
  id: string,
  ctx: GlobalScriptSetupContext
) => {
  const [, file, i] = id.split(':')
  const index = +i.replace('.vue', '')
  if (!ctx[file]?.[index]) return

  const { body } = ctx[file][index]
  const lang = path.extname(file).replace(/^\./, '')
  const code = `<script setup${lang ? ` lang="${lang}"` : ''}>
${body}
</script>`
  return code
}
