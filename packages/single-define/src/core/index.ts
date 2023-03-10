import {
  DEFINE_EMIT,
  DEFINE_PROP,
  MagicString,
  getTransformResult,
  parseSFC,
} from '@vue-macros/common'

import { transformDefineEmit } from './define-emit'
import { transformDefineProp } from './define-prop'
import { type TransformOptions } from './options'

export function transformDefineSingle(code: string, id: string) {
  const { scriptSetup, getSetupAst } = parseSFC(code, id)

  if (!scriptSetup) return

  const offset = scriptSetup.loc.start.offset
  const magicString = new MagicString(code)
  const setupAst = getSetupAst()!

  const options: TransformOptions = {
    code,
    id,
    magicString,
    offset,
    setupAst,
  }

  if (code.includes(DEFINE_EMIT)) {
    transformDefineEmit(options)
  }

  if (code.includes(DEFINE_PROP)) {
    transformDefineProp(options)
  }

  return getTransformResult(magicString, id)
}
