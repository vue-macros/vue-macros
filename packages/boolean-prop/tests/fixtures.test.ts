import { resolve } from 'node:path'
import {
  rollupBuild,
  RollupVue,
  testFixtures,
  UnpluginOxc,
} from '@vue-macros/test-utils'
import { describe } from 'vitest'
import BooleanProp from '../src/vite'

describe('fixtures', async () => {
  await testFixtures(
    'tests/fixtures/*.{vue,[jt]s?(x)}',
    (args, id) =>
      rollupBuild(id, [BooleanProp(), RollupVue(), UnpluginOxc.rollup()]),
    {
      cwd: resolve(__dirname, '..'),
      promise: true,
    },
  )
})
