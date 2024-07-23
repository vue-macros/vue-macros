import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupEsbuildPlugin,
  RollupToStringPlugin,
  testFixtures,
} from '@vue-macros/test-utils'
import { describe } from 'vitest'
import VueDefineProp from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/*/*.vue',
    (args, id) =>
      rollupBuild(id, [
        VueDefineProp({
          isProduction: false,
          edition: id.includes('kevin-edition')
            ? 'kevinEdition'
            : 'johnsonEdition',
        }),
        RollupToStringPlugin(),
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
