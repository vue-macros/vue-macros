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
  loadSetupComponent,
  transformSetupComponent,
} from './setup-component'
import type { SetupComponentContext } from './setup-component'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern | undefined
  version?: 2 | 3
  defineOptions?: boolean
  defineModel?: boolean
  hoistStatic?: boolean
  setupComponent?: boolean | FilterPattern
}

export type OptionsResolved = Omit<Required<Options>, 'setupComponent'> & {
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
    exclude: undefined,
    defineOptions: true,
    defineModel: true,
    hoistStatic: true,
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

export default createUnplugin<Options>((userOptions = {}) => {
  const options = resolveOption(userOptions)
  const filter = createFilter(options.include, options.exclude)
  const filterGlobalScriptSetup = options.setupComponent
    ? createFilter(options.setupComponent)
    : undefined

  const setupComponentContext: SetupComponentContext = {}

  return {
    name,
    enforce: 'pre',

    transformInclude(id) {
      return filter(id) || !!filterGlobalScriptSetup?.(id)
    },

    resolveId(id) {
      if (SETUP_COMPONENT_ID_REGEX.test(id)) return id
    },

    load(id) {
      if (!SETUP_COMPONENT_ID_REGEX.test(id)) return
      return loadSetupComponent(id, setupComponentContext)
    },

    transform(code, id) {
      try {
        if (filter(id)) {
          return transformVueSFC(code, id, options)
        } else if (filterGlobalScriptSetup?.(id)) {
          return transformSetupComponent(code, id, setupComponentContext)
        }
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },
  }
})
