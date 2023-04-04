import {
  HELPER_PREFIX,
  MagicString,
  getTransformResult,
  importHelperFn,
  parseSFC,
} from '@vue-macros/common'
import { analyzeSFC, toRuntimeTypeString } from '@vue-macros/api'
import { type TSEmits, type TSProps } from '@vue-macros/api'

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
        let defaultString = ''
        if (defaultDecl) defaultString = defaultDecl('default')

        const typeString = toRuntimeTypeString(type, isProduction)
        let def: string
        if (!isProduction) {
          def = `{ type: ${typeString}, required: ${required}, ${defaultString} }`
        } else if (typeString) {
          def = `{ type: ${typeString}, ${defaultString} }`
        } else {
          // production: checks are useless
          def = `${defaultString ? `{ ${defaultString} }` : 'null'}`
        }

        return `${JSON.stringify(key)}: ${def}`
      })
      .join(',\n  ')}\n}`

    let decl = runtimeDecls
    if (props.withDefaultsAst && !props.defaults) {
      // dynamic defaults
      decl = `${HELPER_PREFIX}mergeDefaults(${decl}, ${s.sliceNode(
        props.withDefaultsAst.arguments[1],
        { offset }
      )})`
      // add helper
      importHelperFn(s, offset, 'mergeDefaults', 'vue')
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
