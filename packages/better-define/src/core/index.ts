import { MagicString, getTransformResult, parseSFC } from '@vue-macros/common'
import { analyzeSFC } from '@vue-macros/api'
import type { TSEmits, TSProps } from '@vue-macros/api'

export async function transformBetterDefine(
  code: string,
  id: string,
  isProduction?: boolean
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

  return getTransformResult(s, id)

  async function processProps(props: TSProps) {
    const runtimeDefs = await props.getRuntimeDefinitions()

    const runtimeDecls = `{\n  ${Object.entries(runtimeDefs)
      .map(([key, { type, required, default: defaultDecl }]) => {
        const escapedKey = JSON.stringify(key)
        let defaultString = ''
        if (defaultDecl) {
          defaultString = defaultDecl('default')
        }
        if (!isProduction) {
          return `${escapedKey}: { type: ${toRuntimeTypeString(
            type
          )}, required: ${required}, ${defaultString} }`
        } else if (type.some((el) => el === 'Boolean' || el === 'Function')) {
          return `${escapedKey}: { type: ${toRuntimeTypeString(
            type
          )}, ${defaultString} }`
        } else {
          // production: checks are useless
          return `${escapedKey}: ${
            defaultString ? `{ ${defaultString} }` : 'null'
          }`
        }
      })
      .join(',\n  ')}\n}`

    let decl = runtimeDecls
    if (props.withDefaultsAst && !props.defaults) {
      // dynamic defaults
      decl = `_BD_mergeDefaults(${decl}, ${s.sliceNode(
        props.withDefaultsAst.arguments[1],
        { offset }
      )})`
      // add helper
      s.prependLeft(
        offset,
        `import { mergeDefaults as _BD_mergeDefaults } from 'vue'`
      )
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
    s.overwriteNode(emits.defineEmitsAst, `defineEmits(${runtimeDecls})`, {
      offset,
    })
  }
}

function toRuntimeTypeString(types: string[]) {
  return types.length > 1 ? `[${types.join(', ')}]` : types[0]
}
