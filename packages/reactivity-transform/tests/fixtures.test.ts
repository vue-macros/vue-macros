import { resolve } from 'node:path'
import { describe } from 'vitest'
import {
  RollupEsbuildPlugin,
  RollupEscapeNullCharacterPlugin,
  RollupRemoveVueFilePathPlugin,
  RollupVue2,
  rollupBuild,
  testFixtures,
} from '@vue-macros/test-utils'
import VueReactivityTransform from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/*.{vue,js,ts}',
    (args, id) =>
      rollupBuild(id, [
        VueReactivityTransform(),
        RollupVue2({
          compiler: require('vue2/compiler-sfc'),
        }),
        RollupRemoveVueFilePathPlugin(),
        RollupEscapeNullCharacterPlugin(),
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
