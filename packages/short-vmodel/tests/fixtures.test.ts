import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupEsbuildPlugin,
  RollupVue,
  testFixtures,
} from '@vue-macros/test-utils'
import { describe } from 'vitest'
import ShortVmodel from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/*.{vue,[jt]s?(x)}',
    (args, id) =>
      rollupBuild(id, [
        ShortVmodel({ prefix: '::' }),
        RollupVue(),
        RollupEsbuildPlugin({
          target: 'esnext',
        }),
      ]),
    {
      cwd: resolve(__dirname, '..'),
      promise: true,
    },
  )
})
