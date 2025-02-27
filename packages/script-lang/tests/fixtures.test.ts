import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupVue,
  testFixtures,
  UnpluginOxc,
} from '@vue-macros/test-utils'
import { describe } from 'vitest'
import VueScriptLang from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/*.{vue,js,ts}',
    (args, id) =>
      rollupBuild(id, [
        VueScriptLang(),
        RollupVue({
          isProduction: args.isProduction,
          inlineTemplate: args.isProduction,
        }),
        UnpluginOxc.rollup(),
      ]),
    {
      cwd: resolve(__dirname, '..'),
      promise: true,
      params: [['isProduction', [true, false]]],
    },
  )
})
