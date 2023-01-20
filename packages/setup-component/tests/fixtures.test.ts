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
import VueSetupComponent from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/*.{vue,[jt]s?(x)}',
    (args, id) =>
      rollupBuild(id, [
        VueSetupComponent(),
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
