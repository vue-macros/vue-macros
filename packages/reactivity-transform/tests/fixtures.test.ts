import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupVue,
  testFixtures,
  UnpluginOxc,
} from '@vue-macros/test-utils'
import { describe } from 'vitest'
import VueReactivityTransform from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/**/*.{vue,js,ts}',
    async (args, id) =>
      rollupBuild(id, [
        VueReactivityTransform(),
        RollupVue({ compiler: await import('vue/compiler-sfc') }),
        UnpluginOxc.rollup(),
      ]),
    {
      cwd: resolve(__dirname, '..'),
      promise: true,
    },
  )
})
