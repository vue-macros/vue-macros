import { testFixtures } from '@vue-macros/test-utils'
import { describe } from 'vitest'
import { transformJsxDirective } from '../src/api'

describe('jsx-vue-directive', () => {
  describe('v-memo', async () => {
    await testFixtures(
      import.meta.glob('./fixtures/v-memo/*.{vue,jsx,tsx}', {
        eager: true,
        as: 'raw',
      }),
      (_, id, code) => transformJsxDirective(code, id, 3.2)?.code,
    )
  })
})
