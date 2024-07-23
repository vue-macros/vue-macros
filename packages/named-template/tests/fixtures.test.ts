import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupEsbuildPlugin,
  RollupVue,
  RollupVueJsx,
  testFixtures,
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
