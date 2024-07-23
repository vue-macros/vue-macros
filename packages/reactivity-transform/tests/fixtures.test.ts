import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupEsbuildPlugin,
  RollupVue,
  RollupVue2,
  testFixtures,
} from '@vue-macros/test-utils'
import { describe } from 'vitest'
import VueReactivityTransform from '../src/rollup'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/**/*.{vue,js,ts}',
    (args, id) => {
      if (id.includes('vue2'))
        return rollupBuild(id, [
          VueReactivityTransform(),
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
    },
  )
})
