import { describe, expect, test } from 'vitest'
import { transformDefineModel } from '../src/core'

describe('fixtures', () => {
  const files = import.meta.glob('./fixtures/**/*.{vue,js,ts}', {
    eager: true,
    as: 'raw',
  })

  for (const [id, code] of Object.entries(files)) {
    test(id.replace(/\\/g, '/'), () => {
      const version = id.includes('vue2') ? 2 : 3
      const exec = () => transformDefineModel(code, id, version)?.code
      if (id.includes('error')) {
        expect(exec).toThrowErrorMatchingSnapshot()
      } else {
        expect(exec()).toMatchSnapshot()
      }
    })
  }
})
