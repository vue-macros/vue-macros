import { describe } from 'vitest'
import { testFixtures } from '@vue-macros/test-utils'
import { transformJsxDirective } from '../src/api'

describe('jsx-vue-directive', () => {
  describe('v-memo', async () => {
    await testFixtures(
      import.meta.glob('./fixtures/v-memo/*.{vue,jsx,tsx}', {
        eager: true,
        as: 'raw',
      }),
      (args, id, code) => {
        return transformJsxDirective(code, id)?.code
      }
    )
  })
})
