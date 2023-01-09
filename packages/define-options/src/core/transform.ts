import {
  DEFINE_OPTIONS,
  MagicString,
  addNormalScript,
  checkInvalidScopeReference,
  getTransformResult,
  parseSFC,
} from '@vue-macros/common'
import { walkAST } from 'ast-walker-scope'
import { filterMacro, hasPropsOrEmits } from './utils'
import type { ExportDefaultDeclaration, Statement } from '@babel/types'

export function transformDefineOptions(code: string, id: string) {
  if (!code.includes(DEFINE_OPTIONS)) return

  const sfc = parseSFC(code, id)
  if (!sfc.scriptSetup) return
  const { scriptSetup, setupAst, scriptAst } = sfc
  const setupOffset = scriptSetup.loc.start.offset

  const nodes = filterMacro(setupAst!.body)
  if (nodes.length === 0) {
    return
  } else if (nodes.length > 1)
    throw new SyntaxError(`duplicate ${DEFINE_OPTIONS}() call`)

  if (scriptAst) checkDefaultExport(scriptAst.body)

  const setupBindings = getIdentifiers(setupAst!.body)

  const s = new MagicString(code)

  const [node] = nodes
  const [arg] = node.arguments
  if (arg) {
    const normalScript = addNormalScript(sfc, s)

    const scriptOffset = normalScript.start()

    s.appendLeft(
      scriptOffset,
      `\nimport { defineComponent as DO_defineComponent } from 'vue';
export default /*#__PURE__*/ DO_defineComponent(`
    )

    if (arg.type === 'ObjectExpression' && hasPropsOrEmits(arg))
      throw new SyntaxError(
        `${DEFINE_OPTIONS}() please use defineProps or defineEmits instead.`
      )

    checkInvalidScopeReference(arg, DEFINE_OPTIONS, setupBindings)

    s.moveNode(arg, scriptOffset, { offset: setupOffset })

    // removes defineOptions()
    s.remove(setupOffset + node.start!, setupOffset + arg.start!)
    s.remove(setupOffset + arg.end!, setupOffset + node.end!)

    s.appendRight(scriptOffset, ');')
    normalScript.end()
  } else {
    // removes defineOptions()
    s.removeNode(node, { offset: setupOffset })
  }

  return getTransformResult(s, id)
}

const checkDefaultExport = (stmts: Statement[]) => {
  const hasDefaultExport = stmts.some(
    (node): node is ExportDefaultDeclaration =>
      node.type === 'ExportDefaultDeclaration'
  )
  if (hasDefaultExport)
    throw new SyntaxError(
      `${DEFINE_OPTIONS} cannot be used with default export within <script>.`
    )
}

const getIdentifiers = (stmts: Statement[]) => {
  let ids: string[] = []
  walkAST(
    {
      type: 'Program',
      body: stmts,
      directives: [],
      sourceType: 'module',
      sourceFile: '',
    },
    {
      enter(node) {
        if (node.type === 'BlockStatement') {
          this.skip()
        }
      },
      leave(node) {
        if (node.type !== 'Program') return
        ids = Object.keys(this.scope)
      },
    }
  )

  return ids
}
