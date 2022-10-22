import { babelParse } from '@vue-macros/common'
import { describe, expect, test } from 'vitest'
import { resolveTSProperties, resolveTSReferencedType } from '../src/ts'
import { hideAstLocation } from './_util'
import type {
  TSInterfaceDeclaration,
  TSTypeAliasDeclaration,
} from '@babel/types'

describe('ts', () => {
  test('resolveTSProperties', () => {
    const stmts = babelParse(
      `interface Foo extends Base1, Base2 {
  foo: string | number
  ['bar']: Alias
  new (): Foo
  new (param: string): Foo

  todo(): void
  todo(param: string): string

  hello(): void
  hello(param: string): string

  // override
  itShouldBeNumber: number

  // ignore
  hello: string

  // unsupported
  [key: string]: any
}

type Alias = string
type Base1 = {
  itShouldBeBoolean: boolean
  itShouldBeNumber: string
  (): void
}
type Base2 = {
  itShouldBeBoolean: number
  itShouldBeNumber: boolean
  (): string
}
`,
      'ts'
    ).body
    const node = stmts[0] as TSInterfaceDeclaration
    const result = resolveTSProperties(stmts, node)

    expect(hideAstLocation(result)).toMatchInlineSnapshot(`
      {
        "callSignatures": [
          "TSCallSignatureDeclaration...",
          "TSCallSignatureDeclaration...",
        ],
        "constructSignatures": [
          "TSConstructSignatureDeclaration...",
          "TSConstructSignatureDeclaration...",
        ],
        "methods": {
          "hello": [
            "TSMethodSignature...",
            "TSMethodSignature...",
          ],
          "todo": [
            "TSMethodSignature...",
            "TSMethodSignature...",
          ],
        },
        "properties": {
          "bar": {
            "optional": false,
            "signature": "TSPropertySignature...",
            "value": "TSTypeReference...",
          },
          "foo": {
            "optional": false,
            "signature": "TSPropertySignature...",
            "value": "TSUnionType...",
          },
          "itShouldBeBoolean": {
            "optional": false,
            "signature": "TSPropertySignature...",
            "value": "TSBooleanKeyword...",
          },
          "itShouldBeNumber": {
            "optional": false,
            "signature": "TSPropertySignature...",
            "value": "TSNumberKeyword...",
          },
        },
      }
    `)
  })

  test('resolveTSReferencedType', () => {
    const stmts = babelParse(
      `export type AliasString1 = string
type AliasString2 = AliasString1
type Foo = AliasString`,
      'ts'
    ).body
    const node = stmts[1] as TSTypeAliasDeclaration
    const result = resolveTSReferencedType(stmts, node.typeAnnotation)!
    expect(result.type).toBe('TSStringKeyword')
  })
})
