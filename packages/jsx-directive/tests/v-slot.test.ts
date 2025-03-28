import { testFixtures } from '@vue-macros/test-utils'
import { describe } from 'vitest'
import { transformJsxDirective } from '../src/api'

describe('v-slot', () => {
  describe('vue', async () => {
    await testFixtures(
      import.meta.glob<string>('./fixtures/v-slot/index.vue', {
        eager: true,
        query: '?raw',
        import: 'default',
      }),
      (_, id, code) =>
        transformJsxDirective(code, id, {
          version: 3,
          lib: 'vue',
          prefix: 'v-',
        })?.code,
    )
  })
})
