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
import { REGEX_SETUP_SFC } from '@vue-macros/common'
import VueSetupSFC from '../src/rollup'

describe('setup-component', async () => {
  test('isSetupSFC', () => {
    expect(REGEX_SETUP_SFC.test('foo.setup.ts')).toBe(true)
    expect(REGEX_SETUP_SFC.test('foo.setup.tsx')).toBe(true)
    expect(REGEX_SETUP_SFC.test('foo.setup.jsx')).toBe(true)
    expect(REGEX_SETUP_SFC.test('foo.setup.js')).toBe(true)
    expect(REGEX_SETUP_SFC.test('foo.setup.mjs')).toBe(true)
    expect(REGEX_SETUP_SFC.test('foo.setup.cts')).toBe(true)

    expect(REGEX_SETUP_SFC.test('foo.ts')).toBe(false)
  })

  describe('fixtures', async () => {
    const root = resolve(__dirname, '..')
    const files = await glob('tests/fixtures/*.{vue,[jt]s?(x)}', {
      cwd: root,
      onlyFiles: true,
    })

    for (const file of files) {
      test(file.replace(/\\/g, '/'), async () => {
        const filepath = resolve(root, file)

        const code = await rollupBuild(filepath, [
          VueSetupSFC(),
          RollupVue({
            include: [REGEX_SETUP_SFC],
          }),
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
})
