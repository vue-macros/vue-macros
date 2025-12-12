import {
  detectVueVersion,
  REGEX_SETUP_SFC,
  REGEX_VUE_SFC,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'
import { generatePluginName } from '#macros' with { type: 'macro' }
import { createUnplugin, type FilterPattern, type UnpluginInstance } from 'unplugin'
import { transformSetupBlock } from './core'

export interface Options extends BaseOptions {
  defaultLang?: string
}

export type OptionsResolved = MarkRequired<Options, 'include' | 'version'>

function resolveOptions(options: Options): OptionsResolved {
  const version = options.version || detectVueVersion()
  return {
    include: [REGEX_VUE_SFC, REGEX_SETUP_SFC],
    defaultLang: 'ts',
    ...options,
    version,
  }
}

const name = generatePluginName()

const plugin: UnpluginInstance<Options | undefined, false> = createUnplugin(
  (userOptions = {}) => {
    const options = resolveOptions(userOptions)

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
          return transformSetupBlock(code, id, options.defaultLang)
        },
      },
    }
  },
)
export default plugin
