import { MagicString } from 'vue/compiler-sfc'
import { addToScript, parseSFC } from './vue'
import type { SFCCompiled } from './vue'
import type { TransformContext } from './types'

export const initContext = (code: string, id: string) => {
  let s: MagicString | undefined
  let sfc: SFCCompiled | undefined

  const ctx: TransformContext = {
    code,
    id,

    scriptCode: {
      prepend: '',
      append: '',
    },

    get s() {
      return s || (s = new MagicString(code))
    },
    set s(_s) {
      s = _s
    },

    get sfc() {
      return sfc || (sfc = parseSFC(code, id))
    },
    set sfc(_sfc) {
      sfc = _sfc
    },
  }

  return {
    ctx,
    getMagicString() {
      return s
    },
    getSFC() {
      return sfc
    },
  }
}

export const finalizeContext = (ctx: TransformContext) => {
  addToScript(ctx)
}
