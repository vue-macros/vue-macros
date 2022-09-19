import {
  DEFINE_RENDER,
  MagicString,
  getLang,
  getTransformResult,
} from '@vue-macros/common'
import { js, jsx, ts, tsx } from '@ast-grep/napi'

const isFunction = (kind: string) => kind.includes('function')

export const transformDefineRender = (code: string, id: string) => {
  if (!code.includes(DEFINE_RENDER)) return

  const lang = getLang(id)

  const processor = { js, jsx, ts, tsx, vue: jsx }[lang]
  if (!processor) {
    throw new Error(`not supported lang: ${lang}`)
  }
  const root = processor.parse(code).root()

  const nodes = root.findAll('defineRender($$$)')
  if (nodes.length === 0) return

  const s = new MagicString(code)

  for (const node of nodes) {
    const args = node.field('arguments')?.children()
    if (!args || args.length < 3 /* '(', first arg, ')' */)
      throw new SyntaxError(`bad arguments: ${node.text()}`)

    const [, arg] = args
    const argRng = arg.range()

    const parents = node.ancestors()
    if (parents[0].kind() !== 'expression_statement' || !parents[1]) {
      throw new SyntaxError(`bad case: ${node.text()}`)
    }

    // remove ReturnStatement of the parent
    const returnStmtRange = parents[1]
      .children()
      .find((n) => n.kind() === 'return_statement')
      ?.range()

    if (returnStmtRange)
      s.remove(returnStmtRange.start.index, returnStmtRange.end.index)

    const lastChild = parents[1].children().at(-1)!
    const index = returnStmtRange
      ? returnStmtRange.start.index
      : lastChild.range()[lastChild.kind() === '}' ? 'start' : 'end'].index

    const shouldAddFn = !isFunction(arg.kind()) && arg.kind() !== 'identifier'
    s.appendLeft(index, `return ${shouldAddFn ? '() => (' : ''}`)
    s.move(argRng.start.index, argRng.end.index, index)
    if (shouldAddFn) s.appendRight(index, `)`)

    const nodeRng = node.range()
    // removes `defineRender(`
    s.remove(nodeRng.start.index, argRng.start.index)
    // removes `)`
    s.remove(argRng.end.index, parents[0].range().end.index)
  }

  return getTransformResult(s, id)
}
