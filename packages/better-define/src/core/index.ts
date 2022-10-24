import { MagicString, getTransformResult, parseSFC } from '@vue-macros/common'
import { analyzeSFC } from '@vue-macros/api'
import type { TSProps } from '@vue-macros/api'
import type {} from '@babel/types'

export const transformBetterDefine = async (code: string, id: string) => {
  const s = new MagicString(code)
  const sfc = parseSFC(code, id)
  if (sfc.script || !sfc.scriptSetup) return

  const offset = sfc.scriptSetup.loc.start.offset
  const result = await analyzeSFC(s, sfc)
  if (result.props) {
    processProps(result.props)
  }

  return getTransformResult(s, id)

  async function processProps(props: TSProps) {
    const runtimeDefs = await props.getRuntimeDefinitions()

    // TODO prod, default
    const runtimeDecls = `{\n  ${Object.entries(runtimeDefs)
      .map(
        ([key, { type, required }]) =>
          `${key}: { type: ${toRuntimeTypeString(
            type
          )}, required: ${required} }`
      )
      .join(',\n  ')}\n}`

    s.overwriteNode(props.callExpressionAst, `defineProps(${runtimeDecls})`, {
      offset,
    })
  }

  function toRuntimeTypeString(types: string[]) {
    return types.length > 1 ? `[${types.join(', ')}]` : types[0]
  }
}
