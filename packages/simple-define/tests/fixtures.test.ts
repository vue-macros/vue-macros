import { resolve } from 'node:path'
import { describe } from 'vitest'
import {
  RollupEsbuildPlugin,
  RollupRemoveVueFilePathPlugin,
  RollupVue,
  RollupVueJsx,
  rollupBuild,
  testFixtures,
} from '@vue-macros/test-utils'
import VueSimpleDefine from '../src/rollup'
import { transformSimpleDefineTemplate } from '../src/api'

describe('fixtures', async () => {
  await testFixtures(
    ['tests/fixtures/*.vue', '!tests/fixtures/*.exclude.vue'],
    (args, id) =>
      rollupBuild(id, [
        VueSimpleDefine(),
        RollupVue({
          template: {
            compilerOptions: {
              nodeTransforms: [transformSimpleDefineTemplate()],
            },
          },
        }),
        RollupVueJsx(),
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
})
