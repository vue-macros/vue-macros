import {
  DEFINE_OPTIONS,
  MagicString,
  checkInvalidScopeReference,
  getTransformResult,
  parseSFC,
} from '@vue-macros/common'
import { walkAST } from 'ast-walker-scope'
import { filterMacro, hasPropsOrEmits } from './utils'
import type { ExportDefaultDeclaration, Statement } from '@babel/types'

export const transform = (code: string, id: string) => {
  if (!code.includes(DEFINE_OPTIONS)) return

  const sfc = parseSFC(code, id)
  if (!sfc.scriptSetup) return

  const { script, scriptSetup, scriptCompiled, lang } = sfc
  const setupOffset = scriptSetup.loc.start.offset

  const nodes = filterMacro(scriptCompiled.scriptSetupAst as Statement[])
  if (nodes.length === 0) {
    return
  } else if (nodes.length > 1)
    throw new SyntaxError(`duplicate ${DEFINE_OPTIONS}() call`)

  if (script) checkDefaultExport(scriptCompiled.scriptAst as any)

  const scriptBindings = sfc.scriptCompiled.scriptSetupAst
    ? getIdentifiers(sfc.scriptCompiled.scriptSetupAst as any)
    : []

  const s = new MagicString(code)

  const [node] = nodes
  const [arg] = node.arguments
  if (arg) {
    let scriptOffset: number
    if (script) {
      scriptOffset = script.loc.end.offset
    } else {
      scriptOffset = 0
      const attrs = lang ? ` lang="${lang}"` : ''
      s.prependLeft(scriptOffset, `<script${attrs}>`)
    }

    s.appendLeft(
      scriptOffset,
      `import { defineComponent as DO_defineComponent } from 'vue';
export default /*#__PURE__*/ DO_defineComponent(`.replace('\n', '')
    )

    if (arg.type === 'ObjectExpression' && hasPropsOrEmits(arg))
      throw new SyntaxError(
        `${DEFINE_OPTIONS}() please use defineProps or defineEmits instead.`
      )

    checkInvalidScopeReference(arg, DEFINE_OPTIONS, scriptBindings)

    s.moveNode(arg, scriptOffset, setupOffset)

    // removes defineOptions()
    s.remove(setupOffset + node.start!, setupOffset + arg.start!)
    s.remove(setupOffset + arg.end!, setupOffset + node.end!)

    s.appendRight(scriptOffset, ');')
    if (!script) s.appendRight(scriptOffset, `</script>`)
  } else {
    // removes defineOptions()
    s.removeNode(node, setupOffset)
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
