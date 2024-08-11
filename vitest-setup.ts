import process from 'node:process'
import { testFixturesSkip } from '@vue-macros/test-utils'
import { vi } from 'vitest'

const SKIP_VUE2 = !!process.env.SKIP_VUE2
testFixturesSkip((testName) => testName.includes('vue2') && SKIP_VUE2)

vi.mock('./packages/config/src/config', async (importOriginal) => {
  const mod =
    await importOriginal<typeof import('./packages/config/src/config')>()
  if (process.env.CI) {
    return {
      ...mod,
      loadConfig: vi.fn(() => ({})),
    }
  }
  return mod
})
