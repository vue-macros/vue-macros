import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupVue,
  RollupVueJsx,
  testFixtures,
  UnpluginOxc,
} from '@vue-macros/test-utils'
import { describe } from 'vitest'
import VueNamedTemplate from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/*.vue',
    (args, id) =>
      rollupBuild(id, [
        VueNamedTemplate(),
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
