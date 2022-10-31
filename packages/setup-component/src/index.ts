import { createUnplugin } from 'unplugin'
import { createCombinePlugin } from 'unplugin-combine'
import { createFilter } from '@rollup/pluginutils'
import {
  REGEX_SETUP_SFC,
  REGEX_SRC_FILE,
  REGEX_VUE_SUB,
} from '@vue-macros/common'
import {
  SETUP_COMPONENT_ID_REGEX,
  hotUpdateSetupComponent,
  loadSetupComponent,
  transformPost,
  transformSetupComponent,
} from './core'
import { getMainModule, isSubModule } from './core/sub-module'
import type { UnpluginCombineInstance } from 'unplugin-combine'
import type { PluginContext } from 'rollup'
import type { FilterPattern } from '@rollup/pluginutils'
import type { SetupComponentContext } from './core'

export type { SetupComponentContext } from './core'

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
    exclude: [REGEX_SETUP_SFC, REGEX_VUE_SUB],
    root: process.cwd(),
    ...options,
  }
}

const name = 'unplugin-vue-setup-component'
const PrePlugin = createUnplugin<Options | undefined>(
  (userOptions = {}, meta) => {
    const options = resolveOption(userOptions)
    const filter = createFilter(options.include, options.exclude)

    const setupComponentContext: SetupComponentContext = {}

    return {
      name: `${name}-pre`,
      enforce: 'pre',

      resolveId(id, importer) {
        if (SETUP_COMPONENT_ID_REGEX.test(id)) return id

        if (
          ['rollup', 'vite'].includes(meta.framework) &&
          importer &&
          isSubModule(importer)
        ) {
          const mainModule = getMainModule(importer, options.root)
          return (this as unknown as PluginContext).resolve(id, mainModule, {
            skipSelf: true,
          }) as any
        }
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
  }
)

const PostPlugin = createUnplugin(() => {
  return {
    name: `${name}-post`,
    enforce: 'post',

    transformInclude(id) {
      return isSubModule(id)
    },
    transform(code, id) {
      return transformPost(code, id)
    },

    rollup: {
      transform: {
        order: 'post',
        handler(code, id) {
          if (!isSubModule(id)) return
          return transformPost(code, id)
        },
      },
    },
  }
})

const plugin: UnpluginCombineInstance<Options | undefined> =
  createCombinePlugin<Options | undefined>((options = {}) => {
    return {
      name,
      plugins: [
        [PrePlugin, options],
        [PostPlugin, options],
      ],
    }
  })

export default plugin
