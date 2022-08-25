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
import VueSetupComponent from '../src/rollup'

describe('setup-component', async () => {
  const root = resolve(__dirname, '..')
  const files = await glob('tests/fixtures/*.{vue,[jt]s?(x)}', {
    cwd: root,
    onlyFiles: true,
  })

  for (const file of files) {
    it(file.replace(/\\/g, '/'), async () => {
      const filepath = resolve(root, file)

      const code = await rollupBuild(filepath, [
        VueSetupComponent(),
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
