/// <reference types="vite/client" />

import { describe, expect, test } from 'vitest'
import { finalizeContext, initContext } from '@vue-macros/common'
import { transformHoistStatic } from '../src/hoist-static/transfrom'

describe('define-model', async () => {
  const files = import.meta.glob('./fixtures/hoist-static/*.{vue,js,ts}', {
    eager: true,
    as: 'raw',
  })

  for (const [id, code] of Object.entries(files)) {
    test(id.replace(/\\/g, '/'), async () => {
      const exec = () => {
        const { ctx, getMagicString } = initContext(code, id)
        transformHoistStatic(ctx)
        finalizeContext(ctx)
        return getMagicString()?.toString()
      }
      if (id.includes('error')) {
        expect(exec).toThrowErrorMatchingSnapshot()
      } else {
        expect(exec()).toMatchSnapshot()
      }
    })
  }
})
