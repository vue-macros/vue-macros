import { resolve } from 'node:path'
import { describe } from 'vitest'
import {
  RollupEsbuildPlugin,
  RollupVue,
  rollupBuild,
  testFixtures,
} from '@vue-macros/test-utils'
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
