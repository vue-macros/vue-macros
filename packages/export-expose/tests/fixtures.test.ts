import { testFixtures } from '@vue-macros/test-utils'
import { describe } from 'vitest'
import { transformExportExpose } from '../src/core'

describe('fixtures', async () => {
  await testFixtures(
    import.meta.glob('./fixtures/**/*.vue', {
      eager: true,
      as: 'raw',
    }),
    (args, id, code) => transformExportExpose(code, id)?.code,
  )
})
