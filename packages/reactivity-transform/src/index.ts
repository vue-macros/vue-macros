import { createUnplugin } from 'unplugin'
import { createFilter, normalizePath } from '@rollup/pluginutils'
import {
  REGEX_NODE_MODULES,
  REGEX_SETUP_SFC,
  REGEX_SRC_FILE,
  REGEX_VUE_SFC,
  REGEX_VUE_SUB,
} from '@vue-macros/common'
import { shouldTransform, transform } from './core/impl'
import { helperCode, helperId, transformVueSFC } from './core'
import type { UnpluginContextMeta } from 'unplugin'
import type { MarkRequired } from '@vue-macros/common'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
}

export type OptionsResolved = MarkRequired<Options, 'include'>

function resolveOption(
  options: Options,
  framework: UnpluginContextMeta['framework']
): OptionsResolved {
  return {
    include: [REGEX_SRC_FILE, REGEX_VUE_SFC, REGEX_SETUP_SFC].concat(
      framework === 'webpack' ? REGEX_VUE_SUB : []
    ),
    exclude: [REGEX_NODE_MODULES],
    ...options,
  }
}

const name = 'unplugin-reactivity-transform'

export default createUnplugin<Options | undefined, false>(
  (userOptions = {}, { framework }) => {
    const options = resolveOption(userOptions, framework)
    const filter = createFilter(options.include, options.exclude)

    return {
      name,
      enforce: 'pre',

      resolveId(id) {
        if (id === helperId) return id
      },

      loadInclude(id) {
        return id === helperId
      },

      load(_id) {
        const id = normalizePath(_id)
        if (id === helperId) return helperCode
      },

      transformInclude(id) {
        return filter(id)
      },

      transform(code, id) {
        try {
          if (
            REGEX_VUE_SFC.test(id) ||
            REGEX_SETUP_SFC.test(id) ||
            (framework === 'webpack' && REGEX_VUE_SUB.test(id))
          ) {
            return transformVueSFC(code, id)
          } else {
            if (!shouldTransform(code)) return
            return transform(code, {
              filename: id,
              sourceMap: true,
            })
          }
        } catch (err: unknown) {
          this.error(`${name} ${err}`)
        }
      },
    }
  }
)
