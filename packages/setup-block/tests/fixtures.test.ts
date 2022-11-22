import { describe, expect, test } from 'vitest'
import { transformSetupBlock } from '../src/core'

describe('fixtures', () => {
  const files = import.meta.glob('./fixtures/*.vue', {
    eager: true,
    as: 'raw',
  })

  for (const [id, code] of Object.entries(files)) {
    test(id.replace(/\\/g, '/'), () => {
      const exec = () => transformSetupBlock(code, id, 'magic')?.code

      if (id.includes('error')) {
        expect(exec).toThrowErrorMatchingSnapshot()
      } else {
        expect(exec()).toMatchSnapshot()
      }
    })
  }
})
