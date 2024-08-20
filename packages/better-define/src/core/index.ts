import {
  analyzeSFC,
  genRuntimePropDefinition,
  type TSEmits,
  type TSProps,
} from '@vue-macros/api'
import {
  DEFINE_EMITS,
  escapeKey,
  generateTransform,
  importHelperFn,
  MagicStringAST,
  parseSFC,
  type CodeTransform,
  type TransformError,
} from '@vue-macros/common'
import { ok, safeTry, type Result } from 'neverthrow'

export function transformBetterDefine(
  code: string,
  id: string,
  isProduction = false,
): Promise<
  Result<
    CodeTransform | undefined,
    TransformError<
      | 'Only <script setup> is supported'
      | 'Cannot resolve TS definition.'
      | `Cannot resolve TS definition: ${string}`
      | 'withDefaults: first argument must be a defineProps call.'
      | `unknown node: ${string}`
    >
  >
> {
  return safeTry(async function* () {
    const s = new MagicStringAST(code)
    const sfc = parseSFC(code, id)
    if (!sfc.scriptSetup) return ok(undefined)

    const offset = sfc.scriptSetup.loc.start.offset
    const result = yield* (await analyzeSFC(s, sfc)).safeUnwrap()
    if (result.props) {
      yield* (await processProps(result.props)).safeUnwrap()
    }
    if (result.emits) {
      processEmits(result.emits)
    }

    return ok(generateTransform(s, id))

    function processProps(props: TSProps) {
      return safeTry(async function* () {
        const runtimeDefs = yield* (
          await props.getRuntimeDefinitions()
        ).safeUnwrap()

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
              properties,
            )}`
          })
          .join(',\n  ')}\n}`

        let decl = runtimeDecls
        if (props.withDefaultsAst && !props.defaults) {
          // dynamic defaults
          decl = `${importHelperFn(
            s,
            offset,
            'mergeDefaults',
          )}(${decl}, ${s.sliceNode(props.withDefaultsAst.arguments[1], {
            offset,
          })})`
          // add helper
        }
        decl = `defineProps(${decl})`

        s.overwriteNode(props.withDefaultsAst || props.definePropsAst, decl, {
          offset,
        })

        return ok(undefined)
      })
    }

    function processEmits(emits: TSEmits) {
      const runtimeDecls = `[${Object.keys(emits.definitions)
        .map((name) => JSON.stringify(name))
        .join(', ')}]`
      s.overwriteNode(
        emits.defineEmitsAst,
        `${DEFINE_EMITS}(${runtimeDecls})`,
        {
          offset,
        },
      )
    }
  })
}
