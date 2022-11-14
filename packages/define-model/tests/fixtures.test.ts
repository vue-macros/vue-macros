import { describe, expect, test } from 'vitest'
import { transformDefineModel } from '../src/core'

describe('fixtures', () => {
  const files = import.meta.glob('./fixtures/**/*.{vue,js,ts}', {
    eager: true,
    as: 'raw',
  })

  for (const [id, code] of Object.entries(files)) {
    test(id.replace(/\\/g, '/'), async () => {
      const version = id.includes('vue2') ? 2 : 3
      const exec = async () =>
        (await transformDefineModel(code, id, version, true))?.code
      if (id.includes('error')) {
        await expect(exec).rejects.toThrowErrorMatchingSnapshot()
      } else {
        expect(await exec()).toMatchSnapshot()
      }
    })
  }
})
