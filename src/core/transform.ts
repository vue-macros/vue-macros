import { compileScript, MagicString } from 'vue/compiler-sfc'
import { DEFINE_OPTIONS_NAME } from './constants'
import { checkInvalidScopeReference, filterMarco, parseSFC } from './utils'
import type { TransformResult } from 'unplugin'

export const transform = (code: string, id: string): TransformResult => {
  const sfc = parseSFC(code, id)
  if (!sfc.scriptSetup) return

  sfc.scriptSetup = compileScript(sfc, {
    id,
  })
  const { script, scriptSetup, source } = sfc

  const nodes = filterMarco(scriptSetup)
  if (nodes.length === 0) return
  else if (nodes.length > 1)
    throw new SyntaxError(`duplicate ${DEFINE_OPTIONS_NAME}() call`)

  if (script)
    throw new SyntaxError(
      `${DEFINE_OPTIONS_NAME} cannot be used, with both script and script-setup.`
    )

  const node = nodes[0]
  const arg = node.arguments[0]
  if (!(node.arguments.length === 1 && arg.type === 'ObjectExpression')) {
    throw new SyntaxError(`${DEFINE_OPTIONS_NAME}() arguments error`)
  }

  checkInvalidScopeReference(arg, DEFINE_OPTIONS_NAME, scriptSetup)

  const argLoc: any = arg.loc
  const argText = scriptSetup.loc.source.slice(
    argLoc.start.index,
    argLoc.end.index
  )

  const s = new MagicString(source)
  s.prepend(
    `<script lang="${
      scriptSetup.attrs.lang || 'js'
    }">\nexport default ${argText}</script>\n`
  )
  s.remove(
    scriptSetup.loc.start.offset + (node.loc.start as any).index,
    scriptSetup.loc.start.offset + (node.loc.end as any).index
  )

  return {
    code: s.toString(),
    get map() {
      return s.generateMap({
        source: id,
        includeContent: true,
      })
    },
  }
}
