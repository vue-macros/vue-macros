import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupEsbuildPlugin,
  RollupJson,
  RollupNodeResolve,
  RollupVue,
  RollupVueJsx,
  testFixtures,
} from '@vue-macros/test-utils'
import { describe } from 'vitest'
import VueBetterDefine from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    ['tests/fixtures/*.vue', '!tests/fixtures/*.exclude.vue'],
    (args, id) =>
      rollupBuild(id, [
        VueBetterDefine({ isProduction: args.isProduction }),
        RollupVue(),
        RollupVueJsx(),
        RollupJson(),
        RollupNodeResolve(),
        RollupEsbuildPlugin({
          target: 'esnext',
        }),
      ]),
    {
      cwd: resolve(__dirname, '..'),
      promise: true,
      params: [['isProduction', [true, false]]],
    },
  )
})
