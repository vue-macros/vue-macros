import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import glob from 'fast-glob'
import {
  RollupEsbuildPlugin,
  RollupRemoveVueFilePathPlugin,
  RollupVue2,
  rollupBuild,
} from '@vue-macros/test-utils'
import VueReactivityTransform from '../src/rollup'

describe('fixtures', async () => {
  const root = resolve(__dirname, '..')
  const files = await glob('tests/fixtures/*.{vue,js,ts}', {
    cwd: root,
    onlyFiles: true,
  })

  for (const file of files) {
    it(file.replace(/\\/g, '/'), async () => {
      const filepath = resolve(root, file)

      const code = await rollupBuild(filepath, [
        VueReactivityTransform(),
        RollupVue2({
          compiler: require('vue/compiler-sfc'),
        }),
        RollupRemoveVueFilePathPlugin(),
        RollupEsbuildPlugin({
          target: 'esnext',
        }),
      ])
      expect(code).toMatchSnapshot()
    })
  }
})
