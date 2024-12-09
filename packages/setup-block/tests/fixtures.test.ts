import { testFixtures } from '@vue-macros/test-utils'
import { describe } from 'vitest'
import { transformSetupBlock } from '../src/core'

describe('fixtures', async () => {
  await testFixtures(
    import.meta.glob<string>('./fixtures/*.vue', {
      eager: true,
      query: '?raw',
      import: 'default',
    }),
    (args, id, code) => transformSetupBlock(code, id, 'magic')?.code,
  )
})
