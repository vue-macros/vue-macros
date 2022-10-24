import { MagicString, parseSFC } from '@vue-macros/common'
import { describe, expect, test } from 'vitest'
import { DefinitionKind, analyzeSFC } from '../src/vue'
import { hideAstLocation } from './_util'
import type { TSEmits, TSProps } from '../src/vue'

describe('analyzeSFC', () => {
  describe('props', async () => {
    const code = `<script setup lang="ts">
type AliasString1 = string
type AliasString2 = AliasString1

defineProps<{
  foo: AliasString2
  str: string
  shouldBeRemovedProperty: number
  onClick(): void
  onClick(param: string): any
  shouldBeRemovedMethod(): void
  shouldBeRemovedMethod(param: string): any

  union?: string | number | boolean
}>()
</script>`
    const s = new MagicString(code)
    const sfc = parseSFC(code, 'test.vue')

    const result = await analyzeSFC(s, sfc)

    const props = result.props as TSProps
    expect(props).not.toBeFalsy()
    expect(props.kind).toBe(DefinitionKind.TS)

    const definitions = () => hideAstLocation(props.definitions)

    test('prop name should be correct', () => {
      expect(Object.keys(props.definitions)).toMatchInlineSnapshot(`
        [
          "onClick",
          "shouldBeRemovedMethod",
          "foo",
          "str",
          "shouldBeRemovedProperty",
          "union",
        ]
      `)
    })

    test('property prop should be correct', () => {
      expect(definitions().foo).toMatchInlineSnapshot(`
        {
          "addByAPI": false,
          "optional": false,
          "signature": {
            "ast": "TSPropertySignature...",
            "code": "foo: AliasString2",
          },
          "type": "property",
          "value": {
            "ast": "TSStringKeyword...",
            "code": "string",
          },
        }
      `)
    })

    test('method prop should be correct', () => {
      expect(definitions().onClick).toMatchInlineSnapshot(`
      {
        "methods": [
          {
            "ast": "TSMethodSignature...",
            "code": "onClick(): void",
          },
          {
            "ast": "TSMethodSignature...",
            "code": "onClick(param: string): any",
          },
        ],
        "type": "method",
      }
    `)
    })

    test('addProp should work', () => {
      expect(props.addProp('addedPropertyProp', 'number | string')).toBe(true)

      // existing
      expect(
        props.addProp('addedPropertyProp', 'number | string | boolean')
      ).toBe(false)

      expect(s.toString()).toContain(`addedPropertyProp: number | string\n`)
      expect(definitions().addedPropertyProp).toMatchInlineSnapshot(`
        {
          "addByAPI": true,
          "optional": false,
          "signature": {
            "ast": "TSPropertySignature...",
            "code": "addedPropertyProp: number | string",
          },
          "type": "property",
          "value": {
            "ast": "TSUnionType...",
            "code": "number | string",
          },
        }
      `)
    })

    describe('removeProp should work', () => {
      test('remove property prop', () => {
        expect(props.removeProp('not-found')).toBe(false)
        expect(props.removeProp('baz')).toBe(false)
        expect(props.removeProp('shouldBeRemovedProperty')).toBe(true)
        expect(s.toString()).not.toContain(`shouldBeRemovedProperty: number`)
      })

      test('remove method prop', () => {
        expect(props.removeProp('shouldBeRemovedMethod')).toBe(true)
        expect(Object.keys(props.definitions)).not.contain(
          'shouldBeRemovedMethod'
        )
        expect(s.toString()).not.toContain(`shouldBeRemovedMethod(): void
  shouldBeRemovedMethod(param: string): any`)
      })

      test('remove props added by API', () => {
        expect(props.addProp('testProp', 'number | string')).toBe(true)
        expect(props.removeProp('testProp')).toBe(true)
      })
    })

    describe('set prop', () => {
      test('set property prop', () => {
        expect(props.setProp('str', 'OverwrotePropertyProp', true)).toBe(true)
        expect(s.toString()).not.toContain(`str: string`)
        expect(s.toString()).toContain(`str?: OverwrotePropertyProp`)
      })

      test('overwrite method prop', () => {
        expect(props.setProp('onClick', '() => OverwroteMethodProp')).toBe(true)
        expect(s.toString()).not.toContain(`onClick(): void
  onClick(param: string): any`)
        expect(s.toString()).toContain(`onClick: () => OverwroteMethodProp`)
      })

      test('set props added by API', () => {
        expect(props.addProp('testProp2', 'any')).toBe(true)
        expect(props.setProp('testProp2', 'string')).toBe(true)
      })
    })

    test('getRuntimeProps', async () => {
      expect(s.toString()).toMatchInlineSnapshot(`
        "<script setup lang=\\"ts\\">
        type AliasString1 = string
        type AliasString2 = AliasString1

        defineProps<{
          foo: AliasString2
          str?: OverwrotePropertyProp
          
          onClick: () => OverwroteMethodProp
          
          
          

          union?: string | number | boolean
          addedPropertyProp: number | string
          testProp: number | string
          testProp2: any
        }>()
        </script>"
      `)

      expect(await props.getRuntimeProps()).toMatchInlineSnapshot(`
        {
          "addedPropertyProp": {
            "required": true,
            "type": [
              "Number",
              "String",
            ],
          },
          "foo": {
            "required": true,
            "type": [
              "String",
            ],
          },
          "onClick": {
            "required": true,
            "type": [
              "Function",
            ],
          },
          "str": {
            "required": false,
            "type": [
              "null",
            ],
          },
          "testProp2": {
            "required": true,
            "type": [
              "String",
            ],
          },
          "union": {
            "required": false,
            "type": [
              "String",
              "Number",
              "Boolean",
            ],
          },
        }
      `)
    })
  })

  describe('emits', async () => {
    const code = `<script setup lang="ts">
defineEmits<{
  (evt: 'foo', arg: string): void
  (evt: 'foo', arg: number): void
}>()
</script>`
    const s = new MagicString(code)
    const sfc = parseSFC(code, 'test.vue')

    const result = await analyzeSFC(s, sfc)

    const emits = result.emits as TSEmits
    expect(emits).not.toBeFalsy()
    expect(emits.kind).toBe(DefinitionKind.TS)

    const definitions = () => hideAstLocation(emits.definitions)

    test('emit name should be correct', () => {
      expect(definitions()).toMatchInlineSnapshot(`
        {
          "foo": [
            {
              "ast": "TSCallSignatureDeclaration...",
              "code": "(evt: 'foo', arg: string): void",
            },
            {
              "ast": "TSCallSignatureDeclaration...",
              "code": "(evt: 'foo', arg: number): void",
            },
          ],
        }
      `)
    })
  })

  test.todo('no define macro')
})
