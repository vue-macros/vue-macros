import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
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
  const files = await glob('tests/fixtures/*.vue', {
    cwd: root,
    onlyFiles: true,
  })

  for (const file of files) {
    it(file.replace(/\\/g, '/'), async () => {
      const filepath = resolve(root, file)

      const code = await rollupBuild(filepath, [
        VueBetterDefine(),
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
