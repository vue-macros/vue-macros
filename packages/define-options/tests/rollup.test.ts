import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupToStringPlugin,
  testFixtures,
} from '@vue-macros/test-utils'
import { describe } from 'vitest'
import VueDefineOptions from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/*.{vue,js,ts}',
    (args, id) => rollupBuild(id, [VueDefineOptions(), RollupToStringPlugin()]),
    {
      cwd: resolve(__dirname, '..'),
      promise: true,
    },
  )
})
