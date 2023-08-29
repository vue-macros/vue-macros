import { resolve } from 'node:path'
import { describe } from 'vitest'
import {
  RollupEsbuildPlugin,
  RollupRemoveVueFilePathPlugin,
  RollupVue,
  RollupVueJsx,
  rollupBuild,
  testFixtures,
} from '@vue-macros/test-utils'
import VScope from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/*.vue',
    (args, id) =>
      rollupBuild(id, [
        VScope(),
        RollupVue(),
        RollupVueJsx(),
        RollupRemoveVueFilePathPlugin(),
        RollupEsbuildPlugin({
          target: 'esnext',
        }),
      ]),
    {
      cwd: resolve(__dirname, '..'),
      promise: true,
    }
  )
})
