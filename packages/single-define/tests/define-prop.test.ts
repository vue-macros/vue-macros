import { HELPER_PREFIX } from '@vue-macros/common'
import { describe, expect, it } from 'vitest'
import { transformDefineSingle } from '../src/core'
import { PROPS_VARIABLE_NAME } from '../src/core/constants'
import { removeSpaces } from './utils'

describe('defineProp', () => {
  it('should transform simple prop', async () => {
    const result = await transformDefineSingle(
      `
      <script setup lang="ts">
        const foo = defineProp('foo')
      </script>`,
      'test.vue',
      false
    )
    const code = removeSpaces(result!.code)

    expect(code).includes(`const ${PROPS_VARIABLE_NAME} = defineProps(["foo"])`)
    expect(code).includes(
      `const foo = ${HELPER_PREFIX}computed(() => ${PROPS_VARIABLE_NAME}["foo"])`
    )
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

    const result = await transformDefineSingle(setupScript, 'test.vue', false)

    const code = removeSpaces(result!.code)

    expect(code).includes(
      `const foo = ${HELPER_PREFIX}computed(() => ${PROPS_VARIABLE_NAME}["foo"])`
    )

    expect(code).includes(
      `const ${PROPS_VARIABLE_NAME} = defineProps({ "foo": ${removeSpaces(
        propOptions
      )},})`
    )
  })

  it('should be able to use defineProp multiple times', async () => {
    const result = await transformDefineSingle(
      `
      <script setup lang="ts" >
        const foo = defineProp('foo')
        const bar = defineProp('bar')
      </script>`,
      'test.vue',
      false
    )
    const code = removeSpaces(result!.code)

    expect(code).includes(
      `const foo = ${HELPER_PREFIX}computed(() => ${PROPS_VARIABLE_NAME}["foo"])`
    )
    expect(code).includes(
      `const bar = ${HELPER_PREFIX}computed(() => ${PROPS_VARIABLE_NAME}["bar"])`
    )
    expect(code).includes(
      `const ${PROPS_VARIABLE_NAME} = defineProps(["foo", "bar"])`
    )
  })
})
