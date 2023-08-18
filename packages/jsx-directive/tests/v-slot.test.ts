import { describe } from 'vitest'
import { testFixtures } from '@vue-macros/test-utils'
import { transformJsxDirective } from '../src/api'

describe('jsx-vue-directive', () => {
  describe('vue 3 v-slot', async () => {
    await testFixtures(
      import.meta.glob('./fixtures/v-slot/index.{vue,jsx,tsx}', {
        eager: true,
        as: 'raw',
      }),
      (_, id, code) => transformJsxDirective(code, id, 3)?.code
    )
  })

  describe('vue 2.7 v-slot', async () => {
    await testFixtures(
      import.meta.glob('./fixtures/v-slot/index.{vue,jsx,tsx}', {
        eager: true,
        as: 'raw',
      }),
      (_, id, code) => transformJsxDirective(code, id, 2.7)?.code
    )
  })
})
