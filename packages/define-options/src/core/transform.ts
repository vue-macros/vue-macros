import { MagicString, compileScript } from '@vue/compiler-sfc'
import {
  DEFINE_OPTIONS,
  appendToScript,
  checkInvalidScopeReference,
  parseSFC,
} from '@vue-macros/common'
import { filterMarco, hasPropsOrEmits } from './utils'
import type { Statement } from '@babel/types'

export const transform = (
  code: string,
  id: string
): MagicString | undefined => {
  if (!code.includes(DEFINE_OPTIONS)) return
  const sfc = parseSFC(code, id)
  if (!sfc.scriptSetup) return

  if (!sfc.scriptSetup.scriptSetupAst) {
    sfc.scriptSetup = compileScript(sfc, {
      id,
    })
  }
  const { scriptSetup } = sfc
  const startOffset = scriptSetup.loc.start.offset

  const nodes = filterMarco(scriptSetup)
  if (nodes.length === 0) return
  else if (nodes.length > 1)
    throw new SyntaxError(`duplicate ${DEFINE_OPTIONS}() call`)

  if (
    (scriptSetup.scriptAst as Statement[])?.some(
      (node) => node.type === 'ExportDefaultDeclaration'
    )
  )
    throw new SyntaxError(
      `${DEFINE_OPTIONS} cannot be used with default export within <script>.`
    )

  const [node] = nodes
  const [arg] = node.arguments
  if (!(node.arguments.length === 1 && arg.type === 'ObjectExpression')) {
    throw new SyntaxError(`${DEFINE_OPTIONS}() arguments error`)
  }

  if (hasPropsOrEmits(arg)) {
    throw new SyntaxError(
      `${DEFINE_OPTIONS}() please use defineProps or defineEmits instead.`
    )
  }

  checkInvalidScopeReference(arg, DEFINE_OPTIONS, scriptSetup)

  const argText = code.slice(startOffset + arg.start!, startOffset + arg.end!)

  const text = `import { defineComponent as DO_defineComponent } from 'vue';
export default /*#__PURE__*/ DO_defineComponent(${argText});\n`

  const s = new MagicString(code)
  appendToScript(sfc, s, text)

  // removes defineOptions()
  s.remove(startOffset + node.start!, startOffset + node.end!)

  return s
}
