import { describe, expect, it } from 'vitest'
import { removeSpaces } from '@vue-macros/test-utils'
import { PROPS_VARIABLE_NAME, transformDefineProp } from '../src/core'

describe("defineProp (Kevin's proposal)", () => {
  it('should transform simple prop', async () => {
    const result = await transformDefineProp(
      `
      <script setup lang="ts">
        const foo = defineProp('foo')
      </script>`,
      'test.vue'
    )
    const code = removeSpaces(result!.code)

    expect(code).includes(`const ${PROPS_VARIABLE_NAME} = defineProps(["foo"])`)
    expect(code).includes(`const foo = __MACROS_toRef(__MACROS_props, "foo")`)
  })

  it('should transform prop with options', async () => {
    const propOptions = `{
      type: [String, Number],
      required: true,
      default: () => Math.random() > 0.5 ? 'foo' : 1
    }
    `
    const setupScript = `
    <script setup lang="ts" >
      const foo = defineProp('foo', ${propOptions})
    </script>`

    const result = await transformDefineProp(setupScript, 'test.vue')

    const code = removeSpaces(result!.code)

    expect(code).includes(`const foo = __MACROS_toRef(__MACROS_props, "foo")`)

    expect(code).includes(
      `const ${PROPS_VARIABLE_NAME} = defineProps({ "foo": ${removeSpaces(
        propOptions
      )},})`
    )
  })

  it('should be able to use defineProp multiple times', async () => {
    const result = await transformDefineProp(
      `
      <script setup lang="ts" >
        const foo = defineProp('foo')
        const bar = defineProp('bar')
      </script>`,
      'test.vue'
    )
    const code = removeSpaces(result!.code)

    expect(code).includes(`const foo = __MACROS_toRef(__MACROS_props, "foo")`)
    expect(code).includes(`const bar = __MACROS_toRef(__MACROS_props, "bar")`)
    expect(code).includes(
      `const ${PROPS_VARIABLE_NAME} = defineProps(["foo", "bar"])`
    )
  })

  it('should emit an error when defineProps', async () => {
    await expect(
      transformDefineProp(
        `
      <script setup lang="ts">
        defineProps({})
        const foo = defineProp('foo')
      </script>`,
        'test.vue'
      )
    ).rejects.toThrowError(
      'defineProp can not be used in the same file as defineProps.'
    )
  })
})
