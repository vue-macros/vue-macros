import {
  type StringLiteral,
  type TSLiteralType,
  type TSType,
  type TSUnionType,
} from '@babel/types'

export function createUnionType(types: TSType[]): TSUnionType {
  return {
    type: 'TSUnionType',
    types,
  }
}

export function createStringLiteral(value: string): StringLiteral {
  return {
    type: 'StringLiteral',
    value,
    extra: {
      rawValue: value,
      raw: JSON.stringify(value),
    },
  }
}

export function createTSLiteralType(
  literal: TSLiteralType['literal']
): TSLiteralType {
  return {
    type: 'TSLiteralType',
    literal,
  }
}
