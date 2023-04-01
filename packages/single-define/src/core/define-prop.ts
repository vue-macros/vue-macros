import {
  DEFINE_PROP,
  HELPER_PREFIX,
  importHelperFn,
  isCallOf,
  walkAST,
} from '@vue-macros/common'
import {
  inferRuntimeType,
  resolveTSReferencedType,
  toRuntimeTypeString,
} from '@vue-macros/api'
import { PROPS_VARIABLE_NAME } from './constants'
import type { TransformOptions } from './options'
import type { Node, TSType } from '@babel/types'

export interface Prop {
  name: string
  definition?: string
  typeParameter?: TSType
}

async function mountProps(
  { id, scriptSetup, setupAst, isProduction }: TransformOptions,
  props: Prop[]
) {
  const isAllWithoutOptions = props.every(
    ({ definition, typeParameter }) => !definition && !typeParameter
  )

  if (isAllWithoutOptions) {
    return `[${props.map(({ name }) => JSON.stringify(name)).join(', ')}]`
  }

  let propsString = '{\n'

  for (const { name, definition, typeParameter } of props) {
    propsString += `  ${JSON.stringify(name)}: `

    let propDef: string | undefined

    if (typeParameter && !isProduction) {
      const resolved = await resolveTSReferencedType({
        scope: {
          filePath: id,
          content: scriptSetup.content,
          ast: setupAst.body,
        },
        type: typeParameter,
      })
      if (resolved)
        propDef = `{ type: ${toRuntimeTypeString(
          await inferRuntimeType(resolved)
        )} }`
    }
    if (definition) {
      if (propDef) {
        propDef = `{ ...${propDef}, ...${definition} }`
      } else {
        propDef = definition
      }
    }

    propsString += `${propDef || 'null'},\n`
  }
  propsString += '}'

  return propsString
}

export async function transformDefineProp(options: TransformOptions) {
  const { setupAst, offset, s } = options
  const props: Prop[] = []

  walkAST<Node>(setupAst, {
    enter(node: Node) {
      if (isCallOf(node, DEFINE_PROP)) {
        const [name, definition] = node.arguments

        if (name.type !== 'StringLiteral') {
          throw new Error(
            `The first argument of ${DEFINE_PROP} must be a string literal.`
          )
        }

        props.push({
          name: name.value,
          definition: definition
            ? s.sliceNode(definition, { offset })
            : undefined,
          typeParameter: node.typeParameters?.params[0],
        })

        s.overwriteNode(
          node,
          `${HELPER_PREFIX}computed(() => ${PROPS_VARIABLE_NAME}[${JSON.stringify(
            name.value
          )}])`,
          { offset }
        )
      }
    },
  })

  if (props.length > 0) {
    importHelperFn(s, offset, 'computed', 'vue')

    s.prependLeft(
      offset!,
      `\nconst ${PROPS_VARIABLE_NAME} = defineProps(${await mountProps(
        options,
        props
      )})\n`
    )
  }
}
