import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupEsbuildPlugin,
  RollupRemoveVueFilePathPlugin,
  RollupVue,
  testFixtures,
} from '@vue-macros/test-utils'
import { describe } from 'vitest'
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
    },
  )
  await testFixtures(
    import.meta.glob<string>('./fixtures/definePropsRefs.vue', {
      eager: true,
      query: '?raw',
      import: 'default',
    }),
    (_, id, code) => transformChainCall(code, id)?.code,
  )
})
