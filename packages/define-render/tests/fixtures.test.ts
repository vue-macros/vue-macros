import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupVue,
  RollupVueJsx,
  testFixtures,
  UnpluginOxc,
} from '@vue-macros/test-utils'
import { describe } from 'vitest'
import VueDefineRender from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/*.{vue,js,ts}',
    (args, id) =>
      rollupBuild(id, [
        RollupVue({
          isProduction: args.isProduction,
          inlineTemplate: args.isProduction,
        }),
        RollupVueJsx(),
        VueDefineRender(),
        UnpluginOxc.rollup(),
      ]),
    {
      cwd: resolve(__dirname, '..'),
      promise: true,
      params: [['isProduction', [true, false]]],
    },
  )
})
