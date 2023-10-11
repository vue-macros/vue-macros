import { DEFINE_PROP, escapeKey } from '@vue-macros/common'
import { genRuntimePropDefinition } from '@vue-macros/api'
import { type Impl, stringifyArray } from './utils'
import type { TSType } from '@babel/types'

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
        parent?.type !== 'VariableDeclarator' ||
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

    async genRuntimeProps(isProduction) {
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

        const types = typeParameter && (await resolveTSType(typeParameter))
        if (rest && !value && !required && !types) {
          def = rest
        } else {
          const properties: string[] = []
          if (value) properties.push(`default: ${value}`)
          if (required) properties.push(`required: ${required}`)
          if (rest) properties.push(`...${rest}`)

          def = genRuntimePropDefinition(types, isProduction, properties)
        }
        propsString += `  ${escapeKey(name)}: ${def},\n`
      }
      propsString += '}'

      return propsString
    },
  }
}
