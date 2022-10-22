import { MagicString, parseSFC } from '@vue-macros/common'
import { describe, expect, test } from 'vitest'
import { DefinitionKind, analyzeSFC } from '../src'
import { hideAstLocation } from './_util'
import type { TSProps } from '../src'

describe('analyzeSFC', () => {
  describe('props', () => {
    const propsDef = `
  foo: AliasString2
  str: string
  shouldBeRemovedProperty: number
  onClick(): void
  onClick(param: string): any
  shouldBeRemovedMethod(): void
  shouldBeRemovedMethod(param: string): any`

    const code = `<script setup lang="ts">
type AliasString1 = string
type AliasString2 = AliasString1

defineProps<{${propsDef}
}>()
</script>`
    const s = new MagicString(code)
    const sfc = parseSFC(code, 'test.vue')

    const result = analyzeSFC(s, sfc)

    const props = result.props as TSProps
    expect(props).not.toBeFalsy()
    expect(props.kind).toBe(DefinitionKind.TS)

    const definitions = () => hideAstLocation(props.definitions)

    test('prop name should be correct', () => {
      expect(Object.keys(props.definitions)).toStrictEqual([
        'onClick',
        'shouldBeRemovedMethod',
        'foo',
        'str',
        'shouldBeRemovedProperty',
      ])
    })

    test('property prop should be correct', () => {
      expect(definitions().foo).toMatchInlineSnapshot(`
      {
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

    test('addRaw should work', () => {
      props.addRaw('addedRawProp: number\n')
      expect(s.toString()).toContain(`addedRawProp: number\n`)
    })

    test('addProp should work', () => {
      props.addProp('addedPropertyProp', 'number | string')
      expect(s.toString()).toContain(`addedPropertyProp: number | string;\n`)
      expect(definitions().addedPropertyProp).toMatchInlineSnapshot(`
        {
          "optional": false,
          "signature": {
            "code": "addedPropertyProp: number | string",
          },
          "type": "property",
          "value": {
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
        expect(s.toString()).not.toContain(`shouldBeRemovedMethod(): void
  shouldBeRemovedMethod(param: string): any`)
      })
    })

    describe('overwriting prop', () => {
      test('overwrite property prop', () => {
        props.addProp('str', 'OverwrotePropertyProp', true)
        expect(s.toString()).not.toContain(`str: string`)
        expect(s.toString()).toContain(`str?: OverwrotePropertyProp;`)
      })

      test('overwrite method prop', () => {
        props.addProp('onClick', '() => OverwroteMethodProp')
        expect(s.toString()).not.toContain(`onClick(): void
  onClick(param: string): any`)
        expect(s.toString()).toContain(`onClick: () => OverwroteMethodProp;`)
      })
    })

    test('final', () => {
      expect(s.toString()).toMatchInlineSnapshot(`
        "<script setup lang=\\"ts\\">
        type AliasString1 = string
        type AliasString2 = AliasString1

        defineProps<{
          foo: AliasString2
          str?: OverwrotePropertyProp;
          
          onClick: () => OverwroteMethodProp;
          
          
          
          addedRawProp: number
          addedPropertyProp: number | string;
        }>()
        </script>"
      `)
    })
  })

  test.todo('no define macro')
})
