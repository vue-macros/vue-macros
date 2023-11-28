import { createUnplugin } from 'unplugin'
import {
  type BaseOptions,
  type MarkRequired,
  REGEX_NODE_MODULES,
  REGEX_SETUP_SFC,
  REGEX_SRC_FILE,
  REGEX_VUE_SUB,
  createFilter,
  detectVueVersion,
} from '@vue-macros/common'
import { generatePluginName } from '#macros' assert { type: 'macro' }
import {
  SETUP_COMPONENT_ID_REGEX,
  type SetupComponentContext,
  hotUpdateSetupComponent,
  loadSetupComponent,
  transformPost,
  transformSetupComponent,
} from './core'
import { getMainModule, isSubModule } from './core/sub-module'
import type { PluginContext } from 'rollup'

export type { SetupComponentContext } from './core'

export interface Options extends BaseOptions {
  root?: string
}
export type OptionsResolved = MarkRequired<
  Options,
  'include' | 'version' | 'root'
>

function resolveOptions(options: Options): OptionsResolved {
  const root = options.root || process.cwd()
  const version = options.version || detectVueVersion(root)
  return {
    include: [REGEX_SRC_FILE],
    exclude: [REGEX_SETUP_SFC, REGEX_VUE_SUB, REGEX_NODE_MODULES],
    ...options,
    root,
    version,
  }
}

const name = generatePluginName()

const PrePlugin = createUnplugin<Options | undefined, false>(
  (userOptions = {}, meta) => {
    const options = resolveOptions(userOptions)
    const filter = createFilter(options)

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
        return transformSetupComponent(code, id, setupComponentContext)
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
  },
)

const PostPlugin = createUnplugin<Options | undefined, false>(() => {
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

const plugin = createUnplugin<Options | undefined, true>(
  (options = {}, meta) => {
    return [PrePlugin.raw(options, meta), PostPlugin.raw(options, meta)]
  },
)

export default plugin
