import { resolve } from 'node:path'
import { REGEX_SETUP_SFC } from '@vue-macros/common'
import {
  rollupBuild,
  RollupVue,
  RollupVueJsx,
  testFixtures,
  UnpluginOxc,
} from '@vue-macros/test-utils'
import { describe, expect, test } from 'vitest'
import VueSetupSFC from '../src/rollup'

describe('setup-component', () => {
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
    await testFixtures(
      'tests/fixtures/*.{vue,[jt]s?(x)}',
      (args, id) =>
        rollupBuild(id, [
          VueSetupSFC(),
          RollupVue({
            include: [REGEX_SETUP_SFC],
          }),
          RollupVueJsx(),
          UnpluginOxc.rollup(),
        ]),
      {
        cwd: resolve(__dirname, '..'),
        promise: true,
      },
    )
  })
})
