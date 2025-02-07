import { testFixtures } from '@vue-macros/test-utils'
import { describe } from 'vitest'
import { transformExportRender } from '../src/core'

describe('fixtures', async () => {
  await testFixtures(
    import.meta.glob<string>('./fixtures/**/*.vue', {
      eager: true,
      query: '?raw',
      import: 'default',
    }),
    (args, id, code) => transformExportRender(code, id)?.code,
  )
})
