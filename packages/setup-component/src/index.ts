import process from 'node:process'
import {
  createFilter,
  detectVueVersion,
  REGEX_NODE_MODULES,
  REGEX_SETUP_SFC,
  REGEX_SRC_FILE,
  REGEX_VUE_SUB,
  type BaseOptions,
  type MarkRequired,
} from '@vue-macros/common'
import { generatePluginName } from '#macros' with { type: 'macro' }
import {
  createUnplugin,
  type FilterPattern,
  type UnpluginInstance,
} from 'unplugin'
import {
  hotUpdateSetupComponent,
  loadSetupComponent,
  SETUP_COMPONENT_ID_REGEX,
  SETUP_COMPONENT_SUB_MODULE,
  transformPost,
  transformSetupComponent,
  type SetupComponentContext,
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

const PrePlugin: UnpluginInstance<Options | undefined, false> = createUnplugin(
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

      load: {
        filter: {
          id: {
            include: SETUP_COMPONENT_ID_REGEX,
          },
        },
        handler(id) {
          return loadSetupComponent(id, setupComponentContext, options.root)
        },
      },

      transform: {
        filter: {
          id: {
            include: options.include as FilterPattern,
            exclude: options.exclude as FilterPattern,
          },
        },
        handler(code, id) {
          return transformSetupComponent(code, id, setupComponentContext)
        },
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

const PostPlugin: UnpluginInstance<Options | undefined, false> = createUnplugin(
  () => {
    return {
      name: `${name}-post`,
      enforce: 'post',

      transform: {
        filter: {
          id: {
            include: SETUP_COMPONENT_ID_REGEX,
          },
        },
        handler(code, id) {
          return transformPost(code, id)
        },
      },

      rollup: {
        transform: {
          order: 'post',
          filter: {
            id: {
              include: SETUP_COMPONENT_SUB_MODULE,
            },
          },
          handler(code, id) {
            return transformPost(code, id)
          },
        },
      },
    }
  },
)

const plugin: UnpluginInstance<Options | undefined, true> = createUnplugin(
  (options = {}, meta) => {
    return [PrePlugin.raw(options, meta), PostPlugin.raw(options, meta)]
  },
)

export default plugin
