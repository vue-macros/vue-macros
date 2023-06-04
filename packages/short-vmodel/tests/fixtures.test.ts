import { resolve } from 'node:path'
import { describe } from 'vitest'
import {
  RollupEsbuildPlugin,
  RollupVue,
  rollupBuild,
  testFixtures,
} from '@vue-macros/test-utils'
import { transformShortVmodel } from '../src/index'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/*.{vue,[jt]s?(x)}',
    (args, id) =>
      rollupBuild(id, [
        RollupVue({
          template: {
            compilerOptions: {
              nodeTransforms: [transformShortVmodel({ prefix: '::' })],
            },
          },
        }),
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
