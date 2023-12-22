import { describe } from 'vitest'
import { testFixtures } from '@vue-macros/test-utils'
import { transformJsxDirective } from '../src/api'

describe('jsx-vue-directive', () => {
  describe('vue 3 v-on', async () => {
    await testFixtures(
      import.meta.glob('./fixtures/v-on/*.{vue,jsx,tsx}', {
        eager: true,
        as: 'raw',
      }),
      (_, id, code) => transformJsxDirective(code, id, 3)?.code,
    )
  })

  describe('vue 2.7 v-on', async () => {
    await testFixtures(
      import.meta.glob('./fixtures/v-on/*.{vue,jsx,tsx}', {
        eager: true,
        as: 'raw',
      }),
      (_, id, code) => transformJsxDirective(code, id, 2.7)?.code,
    )
  })
})
