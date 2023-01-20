import { resolve } from 'node:path'
import { describe } from 'vitest'
import {
  RollupToStringPlugin,
  rollupBuild,
  testFixtures,
} from '@vue-macros/test-utils'
import VueDefineOptions from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/*.{vue,js,ts}',
    (args, id) => rollupBuild(id, [VueDefineOptions(), RollupToStringPlugin()]),
    {
      cwd: resolve(__dirname, '..'),
      promise: true,
    }
  )
})
