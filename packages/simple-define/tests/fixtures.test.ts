import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupEsbuildPlugin,
  RollupRemoveVueFilePathPlugin,
  RollupVue,
  RollupVueJsx,
  testFixtures,
} from '@vue-macros/test-utils'
import { describe } from 'vitest'
import VueSimpleDefine from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    ['tests/fixtures/*.vue'],
    (args, id) =>
      rollupBuild(id, [
        VueSimpleDefine(),
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
    },
  )
})
