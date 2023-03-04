import { testFixtures } from '@vue-macros/test-utils'
import { describe } from 'vitest'
import { transformDefineProp } from '../src/core'

describe('fixtures', async () => {
  await testFixtures(
    import.meta.glob('./fixtures/detalhed.{vue,js,ts}', {
      eager: true,
      as: 'raw',
    }),
    (args, id, code) => transformDefineProp(code, id)?.code
  )
})
