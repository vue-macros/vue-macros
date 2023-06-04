import { resolve } from 'node:path'
import { describe } from 'vitest'
import {
  RollupEsbuildPlugin,
  RollupJson,
  RollupVue,
  RollupVueJsx,
  rollupBuild,
  testFixtures,
} from '@vue-macros/test-utils'
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
        RollupEsbuildPlugin({
          target: 'esnext',
        }),
      ]),
    {
      cwd: resolve(__dirname, '..'),
      promise: true,
      params: [['isProduction', [true, false]]],
    }
  )
})
