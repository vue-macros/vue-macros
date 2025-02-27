import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupVue,
  RollupVueJsx,
  testFixtures,
  UnpluginOxc,
} from '@vue-macros/test-utils'
import { describe } from 'vitest'
import VueSetupComponent from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/*.{vue,[jt]s?(x)}',
    (args, id) =>
      rollupBuild(id, [
        VueSetupComponent(),
        RollupVue(),
        RollupVueJsx(),
        UnpluginOxc.rollup(),
      ]),
    {
      cwd: resolve(__dirname, '..'),
      promise: true,
    },
  )
})
