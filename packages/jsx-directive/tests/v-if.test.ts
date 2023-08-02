import { describe } from 'vitest'
import { testFixtures } from 'packages/test-utils/src'
import { transformJsxDirective } from '../src/api'

describe('jsx-vue-directive', () => {
  describe('v-if', async () => {
    await testFixtures(
      import.meta.glob('./fixtures/v-if/*.{vue,jsx,tsx}', {
        eager: true,
        as: 'raw',
      }),
      (args, id, code) => {
        return transformJsxDirective(code, id)?.code
      }
    )
  })
})
