import path from 'node:path'
import { babelParse } from '@vue-macros/common'
import { describe, expect, test } from 'vitest'
import {
  getTSFile,
  resolveTSFileExports,
  resolveTSProperties,
  resolveTSReferencedType,
} from '../src/ts'
import { hideAstLocation } from './_util'
import type { TSFile } from '../src/ts'
import type {
  TSInterfaceDeclaration,
  TSTypeAliasDeclaration,
} from '@babel/types'

const fixtures = path.resolve(__dirname, 'fixtures')

function mockTSFile(content: string): TSFile {
  return {
    filePath: '/foo.ts',
    content,
    ast: babelParse(content, 'ts').body,
  }
}

describe('ts', () => {
  test('resolveTSProperties', async () => {
    const file = mockTSFile(
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
`
    )
    const node = file.ast[0] as TSInterfaceDeclaration
    const result = await resolveTSProperties(file, node)

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

    expect(
      hideAstLocation(
        await resolveTSReferencedType(file, result.properties.bar.value!)
      )
    ).toMatchInlineSnapshot('"TSStringKeyword..."')
  })

  test('resolveTSReferencedType', async () => {
    const file = mockTSFile(
      `export type AliasString1 = string
type AliasString2 = AliasString1
type Foo = AliasString`
    )
    const node = file.ast[1] as TSTypeAliasDeclaration
    const result = (await resolveTSReferencedType(file, node.typeAnnotation))!
    expect(result.type).toBe('TSStringKeyword')
  })

  describe('resolveTSFileExports', () => {
    test('basic', async () => {
      const file = await getTSFile(path.resolve(fixtures, 'basic/index.ts'))
      const exports = await resolveTSFileExports(file)
      expect(hideAstLocation(exports)).toMatchInlineSnapshot(`
        {
          "ExportAll": "TSLiteralType...",
          "Foo": "TSLiteralType...",
          "FooAlias": "TSLiteralType...",
          "Inferface": "TSInterfaceDeclaration...",
          "Num": "TSNumberKeyword...",
          "OuterTest": "TSLiteralType...",
          "Str": "TSStringKeyword...",
          "StrAlias": "TSStringKeyword...",
          "Test": "TSLiteralType...",
        }
      `)

      expect(
        hideAstLocation(
          await resolveTSProperties(
            file,
            exports.Inferface as TSInterfaceDeclaration
          )
        )
      ).toMatchInlineSnapshot(`
        {
          "callSignatures": [],
          "constructSignatures": [],
          "methods": {},
          "properties": {
            "base1": {
              "optional": false,
              "signature": "TSPropertySignature...",
              "value": "TSBooleanKeyword...",
            },
            "base2": {
              "optional": false,
              "signature": "TSPropertySignature...",
              "value": "TSBooleanKeyword...",
            },
            "foo": {
              "optional": false,
              "signature": "TSPropertySignature...",
              "value": "TSLiteralType...",
            },
          },
        }
      `)
    })

    test('circular referencing', async () => {
      const file = await getTSFile(
        path.resolve(fixtures, 'circular-referencing/foo.ts')
      )
      const exports = await resolveTSFileExports(file)
      expect(hideAstLocation(exports)).toMatchInlineSnapshot(`
        {
          "Bar": "TSLiteralType...",
          "Foo": "TSLiteralType...",
        }
      `)
    })
  })
})
