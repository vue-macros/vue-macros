import { testFixtures } from '@vue-macros/test-utils'
import { describe } from 'vitest'
import { transformDefineEmit } from '../src/core'

describe('fixtures', async () => {
  await testFixtures(
    import.meta.glob('./fixtures/*.{vue,js,ts}', {
      eager: true,
      as: 'raw',
    }),
    (args, id, code) => transformDefineEmit(code, id)?.code
  )
})
