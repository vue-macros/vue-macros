import { testFixtures } from '@vue-macros/test-utils'
import { describe } from 'vitest'
import { transformDefineModels } from '../src/core'

describe('fixtures', async () => {
  await testFixtures(
    import.meta.glob('./fixtures/**/*.{vue,js,ts}', {
      eager: true,
      as: 'raw',
    }),
    (args, id, code) => {
      const version = id.includes('vue2') ? 2 : 3
      return transformDefineModels(code, id, version, true)?.code
    }
  )
})
