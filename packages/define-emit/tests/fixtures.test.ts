import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupToStringPlugin,
  testFixtures,
  UnpluginOxc,
} from '@vue-macros/test-utils'
import { describe } from 'vitest'
import VueDefineEmit from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/*.vue',
    (args, id) =>
      rollupBuild(id, [
        VueDefineEmit({ isProduction: false }),
        RollupToStringPlugin(),
        UnpluginOxc.rollup(),
      ]),
    { cwd: resolve(__dirname, '..'), promise: true },
  )
})
