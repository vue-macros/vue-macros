import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import glob from 'fast-glob'
import {
  RollupEsbuildPlugin,
  RollupRemoveVueFilePathPlugin,
  RollupVue,
  RollupVueJsx,
  rollupBuild,
} from '@vue-macros/test-utils'
import VueBetterDefine from '../src/rollup'

describe('fixtures', async () => {
  const root = resolve(__dirname, '..')
  const files = await glob(
    ['tests/fixtures/*.vue', '!tests/fixtures/*.exclude.vue'],
    {
      cwd: root,
      onlyFiles: true,
    }
  )

  for (const file of files) {
    describe(file.replace(/\\/g, '/'), () => {
      const filepath = resolve(root, file)

      for (const isProduction of [true, false]) {
        test(`isProduction is ${isProduction}`, async () => {
          const code = await rollupBuild(filepath, [
            VueBetterDefine({ isProduction }),
            RollupVue(),
            RollupVueJsx(),
            RollupRemoveVueFilePathPlugin(),
            RollupEsbuildPlugin({
              target: 'esnext',
            }),
          ])
          expect(code).toMatchSnapshot()
        })
      }
    })
  }
})
