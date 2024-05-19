import { resolve } from 'node:path'
import { describe } from 'vitest'
import {
  RollupEsbuildPlugin,
  RollupToStringPlugin,
  rollupBuild,
  testFixtures,
} from '@vue-macros/test-utils'
import VueDefineEmit from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/*.vue',
    (args, id) =>
      rollupBuild(id, [
        VueDefineEmit({ isProduction: false }),
        RollupToStringPlugin(),
        RollupEsbuildPlugin({
          target: 'esnext',
        }),
      ]),
    { cwd: resolve(__dirname, '..'), promise: true },
  )
})
