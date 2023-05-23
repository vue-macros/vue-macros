import { DEFINE_PROP } from '@vue-macros/common'
import { type TSType } from '@babel/types'
import { genRuntimePropDefinition } from '@vue-macros/api'
import { type Impl, stringifyArray } from './utils'

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

    async genRuntimeProps(isProduction) {
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

        const types = typeParameter && (await resolveTSType(typeParameter))

        if (definition && !types) {
          def = definition
        } else {
          const properties: string[] = []
          if (definition) properties.push(`...${definition}`)
          def = genRuntimePropDefinition(types, isProduction, properties)
        }

        propsString += `  ${JSON.stringify(name)}: ${def},\n`
      }
      propsString += '}'

      return propsString
    },
  }
}
