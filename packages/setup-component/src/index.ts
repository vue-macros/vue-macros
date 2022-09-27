import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { REGEX_SETUP_SFC, REGEX_SRC_FILE } from '@vue-macros/common'
import {
  SETUP_COMPONENT_ID_REGEX,
  hotUpdateSetupComponent,
  loadSetupComponent,
  transformSetupComponent,
} from './core'
import type { FilterPattern } from '@rollup/pluginutils'
import type { SetupComponentContext } from './core'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  root?: string
}

export type OptionsResolved = Omit<Required<Options>, 'exclude'> & {
  exclude?: FilterPattern
}

function resolveOption(options: Options): OptionsResolved {
  return {
    include: [REGEX_SRC_FILE],
    exclude: [REGEX_SETUP_SFC],
    root: process.cwd(),
    ...options,
  }
}

const name = 'unplugin-vue-setup-component'

export default createUnplugin((userOptions: Options = {}) => {
  const options = resolveOption(userOptions)
  const filter = createFilter(options.include, options.exclude)

  const setupComponentContext: SetupComponentContext = {}

  return {
    name,

    resolveId(id) {
      if (SETUP_COMPONENT_ID_REGEX.test(id)) return id
    },

    loadInclude(id) {
      return SETUP_COMPONENT_ID_REGEX.test(id)
    },

    load(id) {
      return loadSetupComponent(id, setupComponentContext, options.root)
    },

    transformInclude(id) {
      return filter(id)
    },

    transform(code, id) {
      try {
        return transformSetupComponent(code, id, setupComponentContext)
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },

    vite: {
      configResolved(config) {
        options.root = config.root
      },

      handleHotUpdate: (ctx) => {
        if (filter(ctx.file)) {
          return hotUpdateSetupComponent(ctx, setupComponentContext)
        }
      },
    },
  }
})
