import { testFixtures } from '@vue-macros/test-utils'
import { describe } from 'vitest'
import { transformJsxMacros } from '../src/core'

describe('fixtures', async () => {
  await testFixtures(
    import.meta.glob('./fixtures/**/*.tsx', {
      eager: true,
      as: 'raw',
    }),
    (args, id, code) =>
      transformJsxMacros(code, id, {
        lib: 'vue',
        include: ['*.tsx'],
        version: 3.5,
        defineStyle: { lang: 'scss' },
        importMap: new Map(),
      })?.code,
  )
})

describe('react fixtures', async () => {
  await testFixtures(
    import.meta.glob('./fixtures/**/define-expose.tsx', {
      eager: true,
      as: 'raw',
    }),
    (args, id, code) =>
      transformJsxMacros(code, id, {
        lib: 'react',
        include: ['*.tsx'],
        version: 18,
        defineStyle: { lang: 'scss' },
        importMap: new Map(),
      })?.code,
  )
})
