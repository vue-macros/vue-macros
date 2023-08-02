import {
  DEFINE_EMITS,
  MagicString,
  escapeKey,
  generateTransform,
  importHelperFn,
  parseSFC,
} from '@vue-macros/common'
import {
  type TSEmits,
  type TSProps,
  analyzeSFC,
  genRuntimePropDefinition,
} from '@vue-macros/api'

export async function transformBetterDefine(
  code: string,
  id: string,
  isProduction = false
) {
  const s = new MagicString(code)
  const sfc = parseSFC(code, id)
  if (!sfc.scriptSetup) return

  const offset = sfc.scriptSetup.loc.start.offset
  const result = await analyzeSFC(s, sfc)
  if (result.props) {
    await processProps(result.props)
  }
  if (result.emits) {
    processEmits(result.emits)
  }

  return generateTransform(s, id)

  async function processProps(props: TSProps) {
    const runtimeDefs = await props.getRuntimeDefinitions()

    const runtimeDecls = `{\n  ${Object.entries(runtimeDefs)
      .map(([key, { type, required, default: defaultDecl }]) => {
        let defaultString = ''
        if (defaultDecl) defaultString = defaultDecl('default')

        const properties: string[] = []
        if (!isProduction) properties.push(`required: ${required}`)
        if (defaultString) properties.push(defaultString)

        return `${escapeKey(key)}: ${genRuntimePropDefinition(
          type,
          isProduction,
          properties
        )}`
      })
      .join(',\n  ')}\n}`

    let decl = runtimeDecls
    if (props.withDefaultsAst && !props.defaults) {
      // dynamic defaults
      decl = `${importHelperFn(
        s,
        offset,
        'mergeDefaults'
      )}(${decl}, ${s.sliceNode(props.withDefaultsAst.arguments[1], {
        offset,
      })})`
      // add helper
    }
    decl = `defineProps(${decl})`

    s.overwriteNode(props.withDefaultsAst || props.definePropsAst, decl, {
      offset,
    })
  }

  function processEmits(emits: TSEmits) {
    const runtimeDecls = `[${Object.keys(emits.definitions)
      .map((name) => JSON.stringify(name))
      .join(', ')}]`
    s.overwriteNode(emits.defineEmitsAst, `${DEFINE_EMITS}(${runtimeDecls})`, {
      offset,
    })
  }
}
