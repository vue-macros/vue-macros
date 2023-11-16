import {
  DEFINE_EMIT,
  HELPER_PREFIX,
  MagicString,
  escapeKey,
  generateTransform,
  isCallOf,
  parseSFC,
  walkASTSetup,
} from '@vue-macros/common'
import type * as t from '@babel/types'

export const EMIT_VARIABLE_NAME = `${HELPER_PREFIX}emit`

export interface Emit {
  name: string
  validator?: string
}

export async function transformDefineEmit(code: string, id: string) {
  if (!code.includes(DEFINE_EMIT)) return

  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const offset = scriptSetup.loc.start.offset
  const s = new MagicString(code)
  const setupAst = getSetupAst()!
  const emits: Emit[] = []

  await walkASTSetup(setupAst, (setup) => {
    setup.onEnter(
      (node): node is t.CallExpression => isCallOf(node, DEFINE_EMIT),
      (node, parent) => {
        const [name, validator] = node.arguments
        let emitName: string
        if (!name) {
          if (
            parent?.type !== 'VariableDeclarator' ||
            parent.id.type !== 'Identifier'
          ) {
            throw new Error(
              `A variable must be used to receive the return value of ${DEFINE_EMIT}.`
            )
          }
          emitName = parent.id.name
        } else if (name.type !== 'StringLiteral') {
          throw new Error(
            `The first argument of ${DEFINE_EMIT} must be a string literal.`
          )
        } else {
          emitName = name.value
        }

        emits.push({
          name: emitName,
          validator: validator ? s.sliceNode(validator, { offset }) : undefined,
        })

        s.overwriteNode(
          node,
          `(...args) => ${EMIT_VARIABLE_NAME}(${JSON.stringify(
            emitName
          )}, ...args)`,
          { offset }
        )
      }
    )
  })

  if (emits.length > 0) {
    s.prependLeft(
      offset!,
      `\nconst ${EMIT_VARIABLE_NAME} = defineEmits(${mountEmits()})\n`
    )
  }

  return generateTransform(s, id)

  function mountEmits() {
    const isAllWithoutOptions = emits.every(({ validator }) => !validator)

    if (isAllWithoutOptions) {
      return `[${emits.map(({ name }) => JSON.stringify(name)).join(', ')}]`
    }

    return `{
      ${emits
        .map(
          ({ name, validator }) => `${escapeKey(name)}: ${validator || `null`}`
        )
        .join(',\n  ')}
    }`
  }
}
