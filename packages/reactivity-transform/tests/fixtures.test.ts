import { resolve } from 'node:path'
import { describe } from 'vitest'
import {
  RollupEsbuildPlugin,
  RollupVue,
  RollupVue2,
  rollupBuild,
  testFixtures,
} from '@vue-macros/test-utils'
import VueReactivityTransform from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/**/*.{vue,js,ts}',
    (args, id) => {
      if (id.includes('vue2'))
        return rollupBuild(id, [
          VueReactivityTransform(),
          // @ts-expect-error rollup 4
          RollupVue2({
            compiler: require('vue2/compiler-sfc'),
          }),
          RollupEsbuildPlugin({
            target: 'esnext',
          }),
        ])
      else
        return rollupBuild(id, [
          VueReactivityTransform(),
          RollupVue({
            compiler: require('vue/compiler-sfc'),
          }),
          RollupEsbuildPlugin({
            target: 'esnext',
          }),
        ])
    },
    {
      cwd: resolve(__dirname, '..'),
      promise: true,
    }
  )
})
