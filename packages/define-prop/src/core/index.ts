import {
  DEFINE_PROP,
  DEFINE_PROPS,
  HELPER_PREFIX,
  MagicString,
  getTransformResult,
  importHelperFn,
  isCallOf,
  parseSFC,
  walkAST,
} from '@vue-macros/common'
import {
  inferRuntimeType,
  resolveTSReferencedType,
  toRuntimeTypeString,
} from '@vue-macros/api'
import type { CallExpression, Node, TSType } from '@babel/types'

export const PROPS_VARIABLE_NAME = `${HELPER_PREFIX}props`

export type Edition = 'kevinEdition' | 'johnsonEdition'

export type Impl = (ctx: {
  s: MagicString
  offset: number
  resolveTSType(type: TSType): Promise<string | undefined>
}) => {
  walkCall(node: CallExpression, parent: Node): string
  genRuntimeProps(): Promise<undefined | string>
}

export async function transformDefineProp(
  code: string,
  id: string,
  edition: Edition = 'kevinEdition',
  isProduction = false
) {
  if (!code.includes(DEFINE_PROP)) return

  const { scriptSetup, getSetupAst } = parseSFC(code, id)
  if (!scriptSetup) return

  const setupAst = getSetupAst()!

  const offset = scriptSetup.loc.start.offset
  const s = new MagicString(code)

  const { walkCall, genRuntimeProps } = (
    edition === 'kevinEdition' ? kevinEdition : johnsonEdition
  )({ s, offset, resolveTSType })

  let hasDefineProps = false
  let hasDefineProp = false
  walkAST<Node>(setupAst, {
    enter(node: Node, parent: Node) {
      if (isCallOf(node, DEFINE_PROP)) {
        hasDefineProp = true
        const propName = walkCall(node, parent)
        const toRef = importHelperFn(s, offset, 'toRef', 'vue')
        s.overwriteNode(
          node,
          `${toRef}(${PROPS_VARIABLE_NAME}, ${JSON.stringify(propName)})`,
          { offset }
        )
      } else if (isCallOf(node, DEFINE_PROPS)) {
        hasDefineProps = true
      }
    },
  })

  if (hasDefineProps && hasDefineProp)
    throw new Error(
      `${DEFINE_PROP} can not be used in the same file as ${DEFINE_PROPS}.`
    )

  const runtimeProps = await genRuntimeProps()

  if (runtimeProps)
    s.prependLeft(
      offset!,
      `\nconst ${PROPS_VARIABLE_NAME} = defineProps(${runtimeProps});\n`
    )

  return getTransformResult(s, id)

  async function resolveTSType(type: TSType) {
    const resolved = await resolveTSReferencedType({
      scope: {
        filePath: id,
        content: scriptSetup!.content,
        ast: setupAst.body,
      },
      type,
    })
    return (
      resolved &&
      toRuntimeTypeString(await inferRuntimeType(resolved), isProduction)
    )
  }
}

export const kevinEdition: Impl = ({ s, offset, resolveTSType }) => {
  interface Prop {
    name: string
    definition?: string
    typeParameter?: TSType
  }

  const props: Prop[] = []

  return {
    walkCall(node, parent) {
      const [name, definition] = node.arguments

      let propName: string
      if (!name) {
        if (
          parent.type !== 'VariableDeclarator' ||
          parent.id.type !== 'Identifier'
        )
          throw new Error(
            `A variable must be used to receive the return value of ${DEFINE_PROP} when the first argument is not passed. (kevinEdition)`
          )
        propName = parent.id.name
      } else if (name.type !== 'StringLiteral') {
        throw new Error(
          `The first argument of ${DEFINE_PROP} must be a literal string. (kevinEdition)`
        )
      } else {
        propName = name.value
      }

      props.push({
        name: propName,
        definition: definition
          ? s.sliceNode(definition, { offset })
          : undefined,
        typeParameter: node.typeParameters?.params[0],
      })

      return propName
    },

    async genRuntimeProps() {
      if (props.length === 0) return

      const isAllWithoutOptions = props.every(
        ({ definition, typeParameter }) => !definition && !typeParameter
      )

      if (isAllWithoutOptions) {
        return stringifyArray(props.map(({ name }) => name))
      }

      let propsString = '{\n'

      for (const { name, definition, typeParameter } of props) {
        let def: string

        const type = typeParameter && (await resolveTSType(typeParameter))
        if (definition && !type) {
          def = definition
        } else {
          const pairs: string[] = []
          if (type) pairs.push(`type: ${type}`)
          if (definition) pairs.push(`...${definition}`)
          def = `{ ${pairs.join(', ')} }`
        }

        propsString += `  ${JSON.stringify(name)}: ${def},\n`
      }
      propsString += '}'

      return propsString
    },
  }
}

export const johnsonEdition: Impl = ({ s, offset, resolveTSType }) => {
  interface Prop {
    name: string
    value?: string
    required?: string
    rest?: string
    typeParameter?: TSType
  }

  const props: Prop[] = []

  return {
    walkCall(node, parent) {
      const [value, required, rest] = node.arguments

      if (
        parent.type !== 'VariableDeclarator' ||
        parent.id.type !== 'Identifier'
      )
        throw new Error(
          `A variable must be used to receive the return value of ${DEFINE_PROP} (johnsonEdition)`
        )

      const propName = parent.id.name

      props.push({
        name: propName,
        value: value ? s.sliceNode(value, { offset }) : undefined,
        required: required ? s.sliceNode(required, { offset }) : undefined,
        rest: rest ? s.sliceNode(rest, { offset }) : undefined,
        typeParameter: node.typeParameters?.params[0],
      })

      return propName
    },

    async genRuntimeProps() {
      if (props.length === 0) return

      const isAllWithoutOptions = props.every(
        ({ typeParameter, value, required, rest }) =>
          !typeParameter && !value && !required && !rest
      )

      if (isAllWithoutOptions) {
        return stringifyArray(props.map(({ name }) => name))
      }

      let propsString = '{\n'

      for (const { name, value, required, rest, typeParameter } of props) {
        let def: string

        const type = typeParameter && (await resolveTSType(typeParameter))
        if (rest && !value && !required && !type) {
          def = rest
        } else {
          const pairs: string[] = []
          if (type) pairs.push(`type: ${type}`)
          if (value) pairs.push(`default: ${value}`)
          if (required) pairs.push(`required: ${required}`)
          if (rest) pairs.push(`...${rest}`)
          def = `{ ${pairs.join(', ')} }`
        }
        propsString += `  ${JSON.stringify(name)}: ${def},\n`
      }
      propsString += '}'

      return propsString
    },
  }
}

export function stringifyArray(strs: string[]) {
  return `[${strs.map((s) => JSON.stringify(s)).join(', ')}]`
}
