import { testFixtures } from '@vue-macros/test-utils'
import { describe } from 'vitest'
import { transformJsxDirective } from '../src/api'

describe('v-for', () => {
  describe('vue', async () => {
    await testFixtures(
      import.meta.glob<string>('./fixtures/v-for/*.{vue,jsx,tsx}', {
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

  describe('vue/vapor', async () => {
    await testFixtures(
      import.meta.glob<string>('./fixtures/v-for/*.{vue,jsx,tsx}', {
        eager: true,
        query: '?raw',
        import: 'default',
      }),
      (_, id, code) =>
        transformJsxDirective(code, id, {
          version: 3,
          lib: 'vue/vapor',
          prefix: 'v-',
        })?.code,
    )
  })
})
