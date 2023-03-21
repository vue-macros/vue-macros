import {
  DEFINE_EMIT,
  DEFINE_PROP,
  MagicString,
  getTransformResult,
  parseSFC,
} from '@vue-macros/common'
import { transformDefineEmit } from './define-emit'
import { transformDefineProp } from './define-prop'
import type { TransformOptions } from './options'

export * from './constants'
export * from './define-prop'
export * from './define-emit'
export * from './options'

export async function transformDefineSingle(
  code: string,
  id: string,
  isProduction: boolean
) {
  const { scriptSetup, getSetupAst } = parseSFC(code, id)

  if (!scriptSetup) return

  const offset = scriptSetup.loc.start.offset
  const s = new MagicString(code)
  const setupAst = getSetupAst()!

  const options: TransformOptions = {
    id,
    s,
    offset,
    scriptSetup,
    setupAst,
    isProduction,
  }

  if (code.includes(DEFINE_PROP)) {
    await transformDefineProp(options)
  }

  if (code.includes(DEFINE_EMIT)) {
    await transformDefineEmit(options)
  }

  return getTransformResult(s, id)
}
