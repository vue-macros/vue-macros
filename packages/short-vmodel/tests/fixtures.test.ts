import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import glob from 'fast-glob'
import {
  RollupEsbuildPlugin,
  RollupRemoveVueFilePathPlugin,
  RollupVue,
  rollupBuild,
} from '@vue-macros/test-utils'
import { transformShortVmodel } from '../src/index'

describe('short-vmodel', async () => {
  const fixtures = resolve(__dirname, 'fixtures')
  const files = await glob('*.{vue,[jt]s?(x)}', {
    cwd: fixtures,
    onlyFiles: true,
  })

  for (const file of files) {
    it(file.replace(/\\/g, '/'), async () => {
      const filepath = resolve(fixtures, file)

      const code = await rollupBuild(filepath, [
        RollupVue({
          template: {
            compilerOptions: {
              nodeTransforms: [transformShortVmodel({ prefix: '::' })],
            },
          },
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
