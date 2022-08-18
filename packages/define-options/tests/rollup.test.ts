import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import glob from 'fast-glob'
import { RollupToStringPlugin, rollupBuild } from '@vue-macros/test-utils'
import VueDefineOptions from '../src/rollup'

describe('Rollup', () => {
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
          VueDefineOptions({}),
          RollupToStringPlugin(),
        ]).catch((err) => err)
        expect(code).toMatchSnapshot()
      })
    }
  })
})
