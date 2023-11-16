import { testFixtures } from '@vue-macros/test-utils'
import { describe } from 'vitest'
import { transformSetupBlock } from '../src/core'

describe('fixtures', async () => {
  await testFixtures(
    import.meta.glob('./fixtures/*.vue', {
      eager: true,
      as: 'raw',
    }),
    (args, id, code) => transformSetupBlock(code, id, 'magic')?.code
  )
})
