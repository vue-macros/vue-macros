import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupEsbuildPlugin,
  RollupVue,
  testFixtures,
} from '@vue-macros/test-utils'
import { describe } from 'vitest'
import BooleanProp from '../src/vite'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/*.{vue,[jt]s?(x)}',
    (args, id) =>
      rollupBuild(id, [
        BooleanProp(),
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
