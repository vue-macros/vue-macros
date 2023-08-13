import { describe } from 'vitest'
import { testFixtures } from '@vue-macros/test-utils'
import { transformJsxDirective } from '../src/api'

describe('jsx-vue-directive', () => {
  describe('v-if', async () => {
    await testFixtures(
      import.meta.glob('./fixtures/v-if/*.{vue,jsx,tsx}', {
        eager: true,
        as: 'raw',
      }),
      (_, id, code) => transformJsxDirective(code, id, 2.7)?.code
    )
  })
})
