import { MagicString, getTransformResult, parseSFC } from '@vue-macros/common'
import { analyzeSFC } from '@vue-macros/api'
import type { TSEmits, TSProps } from '@vue-macros/api'
import type {} from '@babel/types'

export const transformBetterDefine = async (code: string, id: string) => {
  const s = new MagicString(code)
  const sfc = parseSFC(code, id)
  if (sfc.script || !sfc.scriptSetup) return

  const offset = sfc.scriptSetup.loc.start.offset
  const result = await analyzeSFC(s, sfc)
  if (result.props) {
    await processProps(result.props)
  }
  if (result.emits) {
    processEmits(result.emits)
  }

  return getTransformResult(s, id)

  async function processProps(props: TSProps) {
    const runtimeDefs = await props.getRuntimeDefinitions()

    // TODO prod mode
    const runtimeDecls = `{\n  ${Object.entries(runtimeDefs)
      .map(([key, { type, required, default: defaultDecl }]) => {
        let defaultString = ''
        if (defaultDecl) {
          defaultString = `, ${defaultDecl('default')}`
        }
        return `${key}: { type: ${toRuntimeTypeString(
          type
        )}, required: ${required}${defaultString} }`
      })
      .join(',\n  ')}\n}`

    s.overwriteNode(
      props.withDefaultsAst || props.definePropsAst,
      `defineProps(${runtimeDecls})`,
      {
        offset,
      }
    )
  }

  function processEmits(emits: TSEmits) {
    const runtimeDecls = `[${Object.keys(emits.definitions)
      .map((name) => JSON.stringify(name))
      .join(', ')}]`
    s.overwriteNode(emits.defineEmitsAst, `defineEmits(${runtimeDecls})`, {
      offset,
    })
  }

  function toRuntimeTypeString(types: string[]) {
    return types.length > 1 ? `[${types.join(', ')}]` : types[0]
  }
}
