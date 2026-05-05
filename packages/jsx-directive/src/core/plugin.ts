import {
  detectVueVersion,
  FilterFileType,
  getFilterPattern,
  REGEX_NODE_MODULES,
  REGEX_SETUP_SFC,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'
import { generatePluginName } from '#macros' with { type: 'macro' }
import { transformJsxDirective } from '.'
import type {
  FilterPattern,
  UnpluginContextMeta,
  UnpluginFactory,
} from 'unplugin'

export type Options = BaseOptions & {
  prefix?: string
  lib?: 'vue' | 'react' | 'preact' | 'solid' | (string & {})
}
export type OptionsResolved = MarkRequired<
  Options,
  'version' | 'prefix' | 'lib'
>

function resolveOptions(
  options: Options,
  framework: UnpluginContextMeta['framework'],
): OptionsResolved {
  const version = options.version || detectVueVersion()
  const include = getFilterPattern(
    [FilterFileType.VUE_SFC, FilterFileType.SRC_FILE],
    framework,
  )
  return {
    include,
    exclude: [REGEX_NODE_MODULES, REGEX_SETUP_SFC],
    ...options,
    prefix: options.prefix ?? 'v-',
    lib: options.lib ?? 'vue',
    version,
  }
}

const name = generatePluginName()

export const plugin: UnpluginFactory<Options | undefined, false> = (
  userOptions = {},
  { framework = 'vite' },
) => {
  const options = resolveOptions(userOptions, framework)

  return {
    name,
    enforce: 'pre',

    transform: {
      filter: {
        id: {
          include: options.include as FilterPattern,
          exclude: options.exclude as FilterPattern,
        },
      },
      handler(code, id) {
        return transformJsxDirective(code, id, options)
      },
    },
  }
}
