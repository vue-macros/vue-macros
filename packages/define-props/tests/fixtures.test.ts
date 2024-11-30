import { testFixtures } from '@vue-macros/test-utils'
import { describe } from 'vitest'
import { transformDefineProps } from '../src/core'

describe('fixtures', async () => {
  await testFixtures(
    import.meta.glob<string>('./fixtures/*.{vue,js,ts}', {
      eager: true,
      query: '?raw',
      import: 'default',
    }),
    (args, id, code) => transformDefineProps(code, id)?.code,
  )
})
