import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { MagicString } from 'vue/compiler-sfc'
import {
  checkInvalidScopeReference,
  filterMarco,
  parseScriptSetup,
  parseSFC,
} from './sfc'
import { DEFINE_OPTIONS_NAME } from './constants'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern | undefined
}

export type OptionsResolved = Required<Options>

function resolveOption(options: Options): OptionsResolved {
  return {
    include: options.include || [/\.vue$/],
    exclude: options.exclude || undefined,
  }
}

export default createUnplugin<Options>((options = {}) => {
  const opt = resolveOption(options)
  const filter = createFilter(opt.include, opt.exclude)

  return {
    name: 'unplugin-vue-define-options',

    transformInclude(id) {
      return filter(id)
    },

    transform(code, id) {
      const { script, scriptSetup, source } = parseSFC(code, id)
      if (!scriptSetup) return

      if (script && scriptSetup.attrs.lang !== script.attrs.lang) {
        this.error(
          new SyntaxError(
            '<script setup> language must be the same as <script>'
          )
        )
        return
      }

      parseScriptSetup(script, scriptSetup)

      const nodes = filterMarco(scriptSetup)
      if (nodes.length === 0) return
      else if (nodes.length > 1) {
        this.error(`duplicate ${DEFINE_OPTIONS_NAME}() call`)
        return
      }

      const node = nodes[0]
      const arg = node.arguments[0]
      if (!(node.arguments.length === 1 && arg.type === 'ObjectExpression')) {
        this.error(`${DEFINE_OPTIONS_NAME}() arguments error`)
        return
      }

      checkInvalidScopeReference(this, arg, DEFINE_OPTIONS_NAME)

      const argLoc: any = arg.loc
      const argText = scriptSetup.content.slice(
        argLoc.start.index,
        argLoc.end.index
      )

      const s = new MagicString(source)
      s.prepend(
        `<script${
          scriptSetup.lang ? ` lang="${scriptSetup.lang}"` : ''
        }>\nexport default ${argText}</script>\n`
      )
      s.remove(
        scriptSetup.loc.start.offset + (node.loc.start as any).index,
        scriptSetup.loc.start.offset + (node.loc.end as any).index
      )

      return {
        code: s.toString(),
        get map() {
          return s.generateMap({
            source: id,
            includeContent: true,
          })
        },
      }
    },
  }
})
