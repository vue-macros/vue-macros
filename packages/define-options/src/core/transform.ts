import {
  DEFINE_OPTIONS,
  checkInvalidScopeReference,
  parseSFC,
} from '@vue-macros/common'
import { walkAST } from 'ast-walker-scope'
import { filterMacro, hasPropsOrEmits } from './utils'
import type { SFCContext } from '@vue-macros/common'
import type { ExportDefaultDeclaration, Statement } from '@babel/types'

export const transform = (ctx: SFCContext) => {
  const { code } = ctx
  if (!code.includes(DEFINE_OPTIONS)) return

  const { sfc, s, id } = ctx
  const { scriptSetup, scriptCompiled } = sfc
  if (!scriptSetup) return

  const startOffset = scriptSetup.loc.start.offset

  const nodes = filterMacro(scriptCompiled.scriptSetupAst as Statement[])
  if (nodes.length === 0) return

  const hasDefaultExport = (scriptCompiled.scriptAst as Statement[])?.some(
    (node): node is ExportDefaultDeclaration =>
      node.type === 'ExportDefaultDeclaration'
  )
  if (hasDefaultExport)
    throw new SyntaxError(
      `${DEFINE_OPTIONS} cannot be used with default export within <script>.`
    )

  const options: string[] = []
  for (const node of nodes) {
    const [arg] = node.arguments
    if (!arg) continue

    if (arg.type === 'ObjectExpression' && hasPropsOrEmits(arg))
      throw new SyntaxError(
        `${DEFINE_OPTIONS}() please use defineProps or defineEmits instead.`
      )

    const scriptBindings = []
    {
      // re-parse sfc
      const sfc = parseSFC(s.toString(), id)
      if (sfc.scriptCompiled.scriptSetupAst)
        scriptBindings.push(
          ...getIdentifiers(sfc.scriptCompiled.scriptSetupAst as any)
        )
    }
    checkInvalidScopeReference(arg, DEFINE_OPTIONS, scriptBindings)

    options.push(code.slice(startOffset + arg.start!, startOffset + arg.end!))
    // removes defineOptions()
    s.remove(startOffset + node.start!, startOffset + node.end!)
  }

  const optionsCode =
    options.length > 1 ? `Object.assign({}, ${options.join(', ')})` : options[0]
  ctx.scriptCode.append += `import { defineComponent as DO_defineComponent } from 'vue';
export default /*#__PURE__*/ DO_defineComponent(${optionsCode});\n`
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
