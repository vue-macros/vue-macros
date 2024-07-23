import path from 'node:path'
import { babelParse } from '@vue-macros/common'
import { describe, expect, test } from 'vitest'
import {
  getTSFile,
  resolveTSNamespace,
  resolveTSProperties,
  resolveTSReferencedType,
  type TSFile,
} from '../src'
import { hideAstLocation } from './_util'
import type {
  TSInterfaceDeclaration,
  TSIntersectionType,
  TSTypeAliasDeclaration,
} from '@babel/types'

const fixtures = path.resolve(__dirname, 'fixtures')

function mockTSFile(content: string): TSFile {
  return {
    kind: 'file',
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

type Intersection =  Base2 & Base1 & { itShouldBeNumber: number }

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
    )
    const interfaceProperties = await resolveTSProperties({
      scope: file,
      type: file.ast![0] as TSInterfaceDeclaration,
    })

    expect(hideAstLocation(interfaceProperties)).toMatchInlineSnapshot(`
      {
        "callSignatures": [
          {
            "type": "TSCallSignatureDeclaration...",
          },
        ],
        "constructSignatures": [
          {
            "type": "TSConstructSignatureDeclaration...",
          },
          {
            "type": "TSConstructSignatureDeclaration...",
          },
        ],
        "methods": {
          "hello": [
            {
              "type": "TSMethodSignature...",
            },
            {
              "type": "TSMethodSignature...",
            },
          ],
          "todo": [
            {
              "type": "TSMethodSignature...",
            },
            {
              "type": "TSMethodSignature...",
            },
          ],
        },
        "properties": {
          "bar": {
            "optional": false,
            "signature": {
              "type": "TSPropertySignature...",
            },
            "value": {
              "type": "TSTypeReference...",
            },
          },
          "foo": {
            "optional": false,
            "signature": {
              "type": "TSPropertySignature...",
            },
            "value": {
              "type": "TSUnionType...",
            },
          },
          "itShouldBeBoolean": {
            "optional": false,
            "signature": {
              "type": "TSPropertySignature...",
            },
            "value": {
              "type": "TSBooleanKeyword...",
            },
          },
          "itShouldBeNumber": {
            "optional": false,
            "signature": {
              "type": "TSPropertySignature...",
            },
            "value": {
              "type": "TSNumberKeyword...",
            },
          },
        },
      }
    `)
    expect(
      hideAstLocation(
        (
          await resolveTSReferencedType(
            interfaceProperties.properties.bar.value!,
          )
        )?.type,
      ),
    ).toMatchInlineSnapshot('"TSStringKeyword..."')

    const intersectionProperties = await resolveTSProperties({
      scope: file,
      type: (file.ast![1] as TSTypeAliasDeclaration)
        .typeAnnotation as TSIntersectionType,
    })
    expect(hideAstLocation(intersectionProperties)).toMatchInlineSnapshot(`
      {
        "callSignatures": [
          {
            "type": "TSCallSignatureDeclaration...",
          },
          {
            "type": "TSCallSignatureDeclaration...",
          },
        ],
        "constructSignatures": [],
        "methods": {},
        "properties": {
          "itShouldBeBoolean": {
            "optional": false,
            "signature": {
              "type": "TSPropertySignature...",
            },
            "value": {
              "type": "TSBooleanKeyword...",
            },
          },
          "itShouldBeNumber": {
            "optional": false,
            "signature": {
              "type": "TSPropertySignature...",
            },
            "value": {
              "type": "TSNumberKeyword...",
            },
          },
        },
      }
    `)
  })

  test('resolveTSReferencedType', async () => {
    const file = mockTSFile(
      `export type AliasString1 = string
type AliasString2 = AliasString1
type Foo = AliasString`,
    )
    const node = file.ast![1] as TSTypeAliasDeclaration
    const result = (await resolveTSReferencedType({
      scope: file,
      type: node.typeAnnotation,
    }))!
    expect(result.type!.type).toBe('TSStringKeyword')
  })

  describe('resolveTSFileExports', () => {
    test('basic', async () => {
      const file = await getTSFile(path.resolve(fixtures, 'basic/index.ts'))
      await resolveTSNamespace(file)
      const exports = file.exports!
      expect(hideAstLocation(exports)).toMatchInlineSnapshot(`
        {
          "ExportAll": {
            "type": "TSLiteralType...",
          },
          "Foo": {
            "type": "TSLiteralType...",
          },
          "FooAlias": {
            "type": "TSLiteralType...",
          },
          "Inferface": {
            "type": "TSInterfaceDeclaration...",
          },
          "Num": {
            "type": "TSNumberKeyword...",
          },
          "OuterTest": {
            "type": "TSLiteralType...",
          },
          "Str": {
            "type": "TSStringKeyword...",
          },
          "StrAlias": {
            "type": "TSStringKeyword...",
          },
          "Test": {
            "type": "TSLiteralType...",
          },
        }
      `)

      expect(
        hideAstLocation(
          await resolveTSProperties({
            scope: file,
            type: exports.Inferface?.type as any,
          }),
        ),
      ).toMatchInlineSnapshot(`
        {
          "callSignatures": [],
          "constructSignatures": [],
          "methods": {},
          "properties": {
            "base1": {
              "optional": false,
              "signature": {
                "type": "TSPropertySignature...",
              },
              "value": {
                "type": "TSBooleanKeyword...",
              },
            },
            "base2": {
              "optional": false,
              "signature": {
                "type": "TSPropertySignature...",
              },
              "value": {
                "type": "TSBooleanKeyword...",
              },
            },
            "foo": {
              "optional": false,
              "signature": {
                "type": "TSPropertySignature...",
              },
              "value": {
                "type": "TSLiteralType...",
              },
            },
          },
        }
      `)
    })

    test('circular referencing', async () => {
      const file = await getTSFile(
        path.resolve(fixtures, 'circular-referencing/foo.ts'),
      )
      await resolveTSNamespace(file)
      const exports = file.exports!
      expect(hideAstLocation(exports)).toMatchInlineSnapshot(`
        {
          "A": {
            "type": "TSTypeReference...",
          },
          "B": {
            "type": "TSTypeReference...",
          },
          "Bar": {
            "type": "TSLiteralType...",
          },
          "Foo": {
            "type": "TSLiteralType...",
          },
        }
      `)
    })

    test('namespace', async () => {
      const file = await getTSFile(path.resolve(fixtures, 'namespace/index.ts'))
      await resolveTSNamespace(file)
      const exports = file.exports!
      expect(hideAstLocation(exports)).toMatchInlineSnapshot(`
        {
          "BarStr": {
            "type": "TSStringKeyword...",
          },
          "Foo": {
            "type": "TSLiteralType...",
          },
          "NSBar": {
            "type": "TSStringKeyword...",
          },
          "NSFoo": {
            "type": "TSBooleanKeyword...",
          },
          "NestedNestedFoo": {
            "type": "TSUnionType...",
          },
          "Num": {
            "type": "TSNumberKeyword...",
          },
          "Str": {
            "type": "TSStringKeyword...",
          },
        }
      `)
    })
  })
})
