import { resolve } from 'node:path'
import { describe } from 'vitest'
import {
  RollupEsbuildPlugin,
  RollupVue,
  RollupVueJsx,
  rollupBuild,
  testFixtures,
} from '@vue-macros/test-utils'
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
    }
  )
})
