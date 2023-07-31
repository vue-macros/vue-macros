import { MagicString, parseSFC } from '@vue-macros/common'
import { describe, expect, test } from 'vitest'
import { DefinitionKind, analyzeSFC } from '../src/vue'
import { hideAstLocation, snapshot } from './_util'

async function complie(code: string) {
  const str = `<script setup lang="ts">\n${code}</script>`
  const s = new MagicString(str)
  const sfc = parseSFC(str, 'test.vue')
  return { ...(await analyzeSFC(s, sfc)), s }
}

describe('analyzeSFC', () => {
  describe('defineProps', () => {
    test('definitions should be correct', async () => {
      const { props } = await complie(`defineProps<{
        foo: string
        bar(): void
        baz: string | number
        qux?: string
      }>()`)
      expect(props!.kind).toBe(DefinitionKind.TS)
      expect(props!.definitions).to.be.a('object')
      expect(Object.keys(props!.definitions)).toEqual([
        'bar',
        'foo',
        'baz',
        'qux',
      ])
      expect(hideAstLocation(props!.definitions.foo)).toEqual(
        expect.objectContaining({
          type: 'property',
          value: {
            ast: 'TSStringKeyword...',
            code: 'string',
          },
        })
      )
      expect(hideAstLocation(props!.definitions.bar)).toEqual(
        expect.objectContaining({
          type: 'method',
          methods: [{ ast: 'TSMethodSignature...', code: 'bar(): void' }],
        })
      )
      expect(hideAstLocation(props!.definitions.baz)).toEqual(
        expect.objectContaining({
          type: 'property',
          value: { ast: 'TSUnionType...', code: 'string | number' },
        })
      )
      expect(hideAstLocation(props!.definitions.qux)).toEqual(
        expect.objectContaining({
          type: 'property',
          optional: true,
        })
      )

      snapshot(hideAstLocation(props!.definitions))
    })

    test('should resolve referenced type', async () => {
      const { props } = await complie(
        `type Foo = string
        defineProps<{ foo: Foo }>()`
      )
      expect(hideAstLocation(props!.definitions.foo)).toEqual(
        expect.objectContaining({
          addByAPI: false,
          optional: false,
          signature: {
            ast: 'TSPropertySignature...',
            code: 'foo: Foo',
          },
          type: 'property',
          value: {
            ast: 'TSStringKeyword...',
            code: 'string',
          },
        })
      )
      snapshot(hideAstLocation(props!.definitions))
    })

    test('should resolve interface extends', async () => {
      const { props } = await complie(
        `interface Base {
          base: boolean
          foo: number
        }
        interface Props extends Base {
          // override
          foo: string
        }
        defineProps<Props>()`
      )
      expect(Object.keys(hideAstLocation(props!.definitions))).toEqual([
        'base',
        'foo',
      ])
      expect(hideAstLocation(props!.definitions.foo)).toEqual(
        expect.objectContaining({
          type: 'property',
          value: {
            ast: 'TSStringKeyword...',
            code: 'string',
          },
        })
      )
      snapshot(hideAstLocation(props!.definitions))
    })

    test('should resolve intersection', async () => {
      const { props } = await complie(
        `interface Base {
          base: boolean
          foo: number
        }
        interface Props {
          // override
          foo: string
        }
        defineProps<Base & Props>()`
      )
      expect(Object.keys(hideAstLocation(props!.definitions))).toEqual([
        'base',
        'foo',
      ])
      expect(hideAstLocation(props!.definitions.foo)).toEqual(
        expect.objectContaining({
          type: 'property',
          value: {
            ast: 'TSStringKeyword...',
            code: 'string',
          },
        })
      )
      snapshot(hideAstLocation(props!.definitions))
    })

    test('addProp should work', async () => {
      const { props, s } = await complie(`defineProps<{
        foo: string
      }>()`)
      expect(props!.addProp('newProp', 'number | string')).toBe(true)
      // don't overwrite existing
      expect(props!.addProp('newProp', 'number | string | boolean')).toBe(false)
      expect(s.toString()).toContain(`newProp: number | string\n`)

      expect(hideAstLocation(props!.definitions.newProp)).toEqual(
        expect.objectContaining({
          type: 'property',
          addByAPI: true,
          optional: false,
          value: {
            ast: 'TSUnionType...',
            code: 'number | string',
          },
        })
      )

      expect(props!.addProp('newProp2', 'string', true)).toBe(true)
      expect(hideAstLocation(props!.definitions.newProp2)).toEqual(
        expect.objectContaining({
          type: 'property',
          addByAPI: true,
          optional: true,
          value: {
            ast: 'TSStringKeyword...',
            code: 'string',
          },
        })
      )

      snapshot(hideAstLocation(props!.definitions))
      snapshot(s.toString())
    })

    test('addProp should work in intersection', async () => {
      const { props, s } = await complie(`
      type Foo = { foo: string }
      type Bar = { bar: number }
      defineProps<Foo & Bar>()`)
      expect(props!.addProp('newProp', 'number | string')).toBe(true)
      expect(s.toString()).toContain(`Foo & Bar`)

      snapshot(hideAstLocation(props!.definitions))
      snapshot(s.toString())
    })

    describe('removeProp should work', () => {
      test('remove property prop', async () => {
        const { props, s } = await complie(`defineProps<{
          foo: string
          bar: number
        }>()`)

        expect(props!.removeProp('not-found')).toBe(false)
        expect(props!.removeProp('foo')).toBe(true)
        expect(Object.keys(props!.definitions)).not.contain('foo')
        expect(s.toString()).not.toContain(`foo: string\n`)

        snapshot(hideAstLocation(props!.definitions))
      })

      test('remove method prop', async () => {
        const { props, s } = await complie(`defineProps<{
          foo(): void
          bar: number
        }>()`)

        expect(props!.removeProp('foo')).toBe(true)
        expect(Object.keys(props!.definitions)).not.contain('foo')
        expect(s.toString()).not.toContain(`foo(): void\n`)

        snapshot(hideAstLocation(props!.definitions))
      })

      test('remove props added by API', async () => {
        const { props, s } = await complie(`defineProps<{
          foo: string
        }>()`)

        expect(props!.addProp('testProp', 'number | string')).toBe(true)
        expect(props!.removeProp('testProp')).toBe(true)

        expect(Object.keys(props!.definitions)).not.contain('testProp')
        // should be not removed in source code.
        expect(s.toString()).toContain(`testProp: number | string\n`)

        snapshot(hideAstLocation(props!.definitions))
        snapshot(s.toString())
      })
    })

    describe('setProp should work', () => {
      test('set property prop', async () => {
        const { props, s } = await complie(`defineProps<{
          foo: string
        }>()`)

        expect(props!.setProp('foo', 'OverwrotePropertyProp', true)).toBe(true)
        expect(s.toString()).not.toContain(`foo: string`)
        expect(s.toString()).toContain(`foo?: OverwrotePropertyProp`)

        snapshot(hideAstLocation(props!.definitions))
        snapshot(s.toString())
      })

      test('set method prop', async () => {
        const { props, s } = await complie(`defineProps<{
          onClick(): void; onClick(param: string): string
        }>()`)

        expect(props!.setProp('onClick', '() => OverwroteMethodProp')).toBe(
          true
        )
        expect(s.toString()).not.toContain(
          `onClick(): void; onClick(param: string): string`
        )
        expect(s.toString()).toContain(`onClick: () => OverwroteMethodProp`)

        snapshot(hideAstLocation(props!.definitions))
        snapshot(s.toString())
      })

      test('set props added by API', async () => {
        const { props, s } = await complie(`defineProps<{}>()`)

        expect(props!.addProp('foo', 'number | string')).toBe(true)
        expect(props!.setProp('foo', 'string')).toBe(true)

        expect(hideAstLocation(props!.definitions.foo)).toEqual(
          expect.objectContaining({
            type: 'property',
            addByAPI: true,
            value: {
              ast: 'TSStringKeyword...',
              code: 'string',
            },
          })
        )

        // should be not updated in source code.
        expect(s.toString()).toContain(`foo: number | string\n`)

        snapshot(hideAstLocation(props!.definitions))
        snapshot(s.toString())
      })
    })

    test('getRuntimeProps', async () => {
      const { props } = await complie(`
      type AliasString1 = string
      type AliasString2 = AliasString1

      defineProps<{
        foo: AliasString2
        bar: string
        baz(): string
        union: string | Map<string, string>
        optional?: string[]

        onClick(): void
        onClick(param: string): any
      }>()`)

      expect(await props!.getRuntimeDefinitions()).toEqual({
        bar: {
          type: ['String'],
          required: true,
        },
        foo: {
          type: ['String'],
          required: true,
        },
        baz: {
          type: ['Function'],
          required: true,
        },
        onClick: {
          type: ['Function'],
          required: true,
        },
        optional: {
          type: ['Array'],
          required: false,
        },
        union: {
          type: ['String', 'Map'],
          required: true,
        },
      })

      snapshot(hideAstLocation(props!.definitions))
    })
  })

  test('defineProps w/ withDefaults (static)', async () => {
    const { props } = await complie(`withDefaults(defineProps<{
      foo: string
      bar?(): void
      baz: string | number
      qux?: string
      quux?: string
      fred?(): Promise<string>
    }>(), {
      bar(...args) { return 'bar' },
      qux: 'hello',
      get quux() { return 'quux' },
      async fred() { await Promise.resolve('fred') },
      ['unknown']: 'world'
    })`)
    expect(Object.keys(props!.defaults!)).toEqual([
      'bar',
      'qux',
      'quux',
      'fred',
      'unknown',
    ])
    const defaults = await props!.getRuntimeDefinitions()
    for (const k of Object.keys(defaults)) {
      if (defaults[k].default) {
        defaults[k].default = defaults[k].default!() as any
      }
    }
    expect(defaults).toEqual({
      bar: {
        required: false,
        type: ['Function'],
        default: "default(...args) { return 'bar' }",
      },
      baz: {
        type: ['String', 'Number'],
        required: true,
      },
      foo: {
        type: ['String'],
        required: true,
      },
      qux: {
        type: ['String'],
        required: false,
        default: "default: 'hello'",
      },
      quux: {
        type: ['String'],
        required: false,
        default: "get default() { return 'quux' }",
      },
      fred: {
        type: ['Function'],
        required: false,
        default: "async default() { await Promise.resolve('fred') }",
      },
    })

    snapshot(props!.defaults)
  })

  test('defineProps w/ withDefaults (dynamic)', async () => {
    const { props } = await complie(`withDefaults(defineProps<{
      foo: string
      bar?: number
    }>(), {
      ['b' + 'ar']: 'bar'
    })`)
    const defaults = await props!.getRuntimeDefinitions()
    expect(defaults.bar.default).toBeUndefined()
    expect(props!.defaults).toBeUndefined()
  })
  test.todo('mutate defaults')

  describe('defineEmits', () => {
    test('definitions should be correct', async () => {
      const { emits } = await complie(`defineEmits<{
       (evt: 'click'): void
       (evt: 'click', param: string): void
       (evt: 'change', param: string): void
       (evt: 1): void
      }>()`)
      expect(emits!.kind).toBe(DefinitionKind.TS)
      expect(emits!.definitions).to.be.a('object')
      expect(Object.keys(emits!.definitions)).toEqual(['1', 'click', 'change'])
      expect(hideAstLocation(emits!.definitions.click[0])).toEqual({
        ast: 'TSCallSignatureDeclaration...',
        code: "(evt: 'click'): void",
      })
      expect(hideAstLocation(emits!.definitions.click[1])).toEqual({
        ast: 'TSCallSignatureDeclaration...',
        code: "(evt: 'click', param: string): void",
      })
      expect(hideAstLocation(emits!.definitions.change[0])).toEqual({
        ast: 'TSCallSignatureDeclaration...',
        code: "(evt: 'change', param: string): void",
      })
      expect(hideAstLocation(emits!.definitions[1][0])).toEqual({
        ast: 'TSCallSignatureDeclaration...',
        code: '(evt: 1): void',
      })

      snapshot(hideAstLocation(emits!.definitions))
    })

    test('should resolve referenced type', async () => {
      const { emits } = await complie(
        `type Foo = 'foo'
        defineEmits<{ (evt: Foo): void }>()`
      )
      expect(hideAstLocation(emits!.definitions.foo)).toEqual([
        {
          ast: 'TSCallSignatureDeclaration...',
          code: '(evt: Foo): void',
        },
      ])
      snapshot(hideAstLocation(emits!.definitions))
    })

    test('should resolve interface extends', async () => {
      const { emits } = await complie(
        `interface Base {
          (evt: 'foo'): void
        }
        interface Emits extends Base {
          (evt: 'foo', param?: string): void
        }
        defineEmits<Emits>()`
      )
      expect(Object.keys(hideAstLocation(emits!.definitions))).toEqual(['foo'])
      expect(hideAstLocation(emits!.definitions.foo)).toEqual([
        {
          ast: 'TSCallSignatureDeclaration...',
          code: "(evt: 'foo'): void",
        },
        {
          ast: 'TSCallSignatureDeclaration...',
          code: "(evt: 'foo', param?: string): void",
        },
      ])
      snapshot(hideAstLocation(emits!.definitions))
    })

    test('should resolve intersection', async () => {
      const { emits } = await complie(
        `interface Base {
          (evt: 'foo'): void
        }
        interface Emits {
          (evt: 'foo', param?: string): void
        }
        defineEmits<Base & Emits>()`
      )
      expect(Object.keys(hideAstLocation(emits!.definitions))).toEqual(['foo'])
      expect(hideAstLocation(emits!.definitions.foo)).toEqual([
        {
          ast: 'TSCallSignatureDeclaration...',
          code: "(evt: 'foo'): void",
        },
        {
          ast: 'TSCallSignatureDeclaration...',
          code: "(evt: 'foo', param?: string): void",
        },
      ])
      snapshot(hideAstLocation(emits!.definitions))
    })

    test('addEmit should work', async () => {
      const { emits, s } = await complie(`defineEmits<{
        (evt: 'click'): void
      }>()`)
      emits!.addEmit('change', `(evt: 'change'): void`)
      emits!.addEmit('click', `(evt: 'click', param: string): void`)
      expect(s.toString()).toContain(`(evt: 'change'): void\n`)
      expect(s.toString()).toContain(`(evt: 'click', param: string): void\n`)

      expect(hideAstLocation(emits!.definitions.click)).toEqual([
        {
          ast: 'TSCallSignatureDeclaration...',
          code: "(evt: 'click'): void",
        },
        {
          ast: 'TSCallSignatureDeclaration...',
          code: "(evt: 'click', param: string): void",
        },
      ])
      expect(hideAstLocation(emits!.definitions.change)).toEqual([
        {
          ast: 'TSCallSignatureDeclaration...',
          code: "(evt: 'change'): void",
        },
      ])

      snapshot(hideAstLocation(emits!.definitions))
      snapshot(s.toString())
    })

    test('addEmit should work in intersection', async () => {
      const { emits, s } = await complie(`defineEmits<{
        (evt: 'click'): void
      } & { (evt: 'change'): void }>()`)
      emits!.addEmit('update', `(evt: 'update'): void`)
      expect(s.toString()).toContain(` & { (evt: 'update'): void }`)

      expect(hideAstLocation(emits!.definitions.update)).toEqual([
        {
          ast: 'TSCallSignatureDeclaration...',
          code: "(evt: 'update'): void",
        },
      ])
      snapshot(hideAstLocation(emits!.definitions))
      snapshot(s.toString())
    })

    describe.todo('removeProp should work', () => {
      test.todo('remove property prop')

      test.todo('remove props added by API')
    })

    describe.todo('setProp should work', () => {
      test.todo('set property prop')

      test.todo('set method prop')

      test.todo('set props added by API')
    })
  })

  test('no define macro', async () => {
    const result = await complie(`console.log('test')`)
    expect(result.props).toBeUndefined()
    expect(result.emits).toBeUndefined()
  })
})
