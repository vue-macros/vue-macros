import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { getPackageInfoSync } from 'local-pkg'
import { transform as transformDefineOptions } from 'unplugin-vue-define-options'
import {
  finalizeContext,
  getTransformResult,
  initContext,
} from '@vue-macros/common'
import { transformDefineModel } from './define-model'
import { transformHoistStatic } from './hoist-static'
import {
  SETUP_COMPONENT_ID_REGEX,
  hotUpdateSetupComponent,
  loadSetupComponent,
  transformSetupComponent,
} from './setup-component'

import type { SetupComponentContext } from './setup-component'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  root?: string
  version?: 2 | 3
  defineOptions?: boolean
  defineModel?: boolean
  hoistStatic?: boolean
  setupComponent?: boolean | FilterPattern
}

export type OptionsResolved = Omit<
  Required<Options>,
  'exclude' | 'setupComponent' | 'setupSFC'
> & {
  exclude?: FilterPattern
  setupComponent: false | FilterPattern
}

function resolveOption(options: Options): OptionsResolved {
  let version: 2 | 3 | undefined = options.version
  if (version === undefined) {
    const vuePkg = getPackageInfoSync('vue')
    if (vuePkg) {
      version = +vuePkg.version.slice(0, 1) as 2 | 3
    } else {
      version = 3
    }
  }
  const setupComponent =
    options.setupComponent === false ? false : [/\.[cm]?[jt]sx?/]

  return {
    include: [/\.vue$/],
    defineOptions: true,
    defineModel: true,
    hoistStatic: true,
    root: process.cwd(),
    ...options,
    version,
    setupComponent,
  }
}

const name = 'unplugin-vue-macros'

function transformVueSFC(code: string, id: string, options: OptionsResolved) {
  const { ctx, getMagicString } = initContext(code, id)
  if (options.hoistStatic) transformHoistStatic(ctx)
  if (options.defineOptions) transformDefineOptions(ctx)
  if (options.defineModel) transformDefineModel(ctx, options.version)
  finalizeContext(ctx)
  return getTransformResult(getMagicString(), id)
}

export default createUnplugin((userOptions: Options = {}) => {
  const options = resolveOption(userOptions)
  const filterSFC = createFilter(options.include, options.exclude)
  const filterSetupComponent = options.setupComponent
    ? createFilter(options.setupComponent)
    : undefined

  const setupComponentContext: SetupComponentContext = {}

  return {
    name,

    transformInclude(id) {
      if (filterSetupComponent?.(id)) return true
      return filterSFC(id)
    },

    resolveId: options.setupComponent
      ? (id) => {
          if (SETUP_COMPONENT_ID_REGEX.test(id)) return id
        }
      : undefined,

    load: options.setupComponent
      ? (id) => {
          if (SETUP_COMPONENT_ID_REGEX.test(id))
            return loadSetupComponent(id, setupComponentContext, options.root)
        }
      : undefined,

    transform(code, id) {
      try {
        if (filterSFC(id)) {
          return transformVueSFC(code, id, options)
        } else if (filterSetupComponent?.(id)) {
          return transformSetupComponent(code, id, setupComponentContext)
        }
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },

    vite: {
      configResolved(config) {
        options.root = config.root
      },

      handleHotUpdate: filterSetupComponent
        ? (ctx) => {
            if (filterSetupComponent(ctx.file))
              return hotUpdateSetupComponent(ctx, setupComponentContext)
          }
        : undefined,
    },
  }
})
