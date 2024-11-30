import { testFixtures } from '@vue-macros/test-utils'
import { describe } from 'vitest'
import { transformJsxDirective } from '../src/api'

describe('jsx-vue-directive', () => {
  describe('v-memo', async () => {
    await testFixtures(
      import.meta.glob<string>('./fixtures/v-memo/*.{vue,jsx,tsx}', {
        eager: true,
        query: '?raw',
        import: 'default',
      }),
      (_, id, code) => transformJsxDirective(code, id, 3.2)?.code,
    )
  })
})
