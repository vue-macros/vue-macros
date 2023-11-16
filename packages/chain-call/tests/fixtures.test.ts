import { resolve } from 'node:path'
import { describe } from 'vitest'
import {
  RollupEsbuildPlugin,
  RollupRemoveVueFilePathPlugin,
  RollupVue,
  rollupBuild,
  testFixtures,
} from '@vue-macros/test-utils'
import { transformChainCall } from '../src/core'
import VueChainCall from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    ['tests/fixtures/*.vue', '!tests/fixtures/definePropsRefs.vue'],
    (_, id) =>
      rollupBuild(id, [
        VueChainCall(),
        RollupVue(),
        RollupRemoveVueFilePathPlugin(),
        RollupEsbuildPlugin({
          target: 'esnext',
        }),
      ]),
    {
      cwd: resolve(__dirname, '..'),
      promise: true,
    }
  )
  await testFixtures(
    import.meta.glob('./fixtures/definePropsRefs.vue', {
      eager: true,
      as: 'raw',
    }),
    (_, id, code) => transformChainCall(code, id)?.code
  )
})
