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
  GLOBAL_SCRIPT_SETUP_ID_REGEX,
  loadGlobalScriptSetup,
  transformGlobalScriptSetup,
} from './global-script-setup'
import type { GlobalScriptSetupContext } from './global-script-setup'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern | undefined
  version?: 2 | 3
  defineOptions?: boolean
  defineModel?: boolean
  hoistStatic?: boolean
  globalScriptSetup?: boolean | FilterPattern
}

export type OptionsResolved = Omit<Required<Options>, 'globalScriptSetup'> & {
  globalScriptSetup: false | FilterPattern
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
  const globalScriptSetup =
    options.globalScriptSetup === false ? false : [/\.[cm]?[jt]sx?/]

  return {
    include: [/\.vue$/],
    exclude: undefined,
    defineOptions: true,
    defineModel: true,
    hoistStatic: true,
    ...options,
    version,
    globalScriptSetup,
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
  const filterGlobalScriptSetup = options.globalScriptSetup
    ? createFilter(options.globalScriptSetup)
    : undefined

  const globalScriptSetupContext: GlobalScriptSetupContext = {}

  return {
    name,
    enforce: 'pre',

    transformInclude(id) {
      return filter(id) || !!filterGlobalScriptSetup?.(id)
    },

    resolveId(id) {
      if (GLOBAL_SCRIPT_SETUP_ID_REGEX.test(id)) return id
    },

    load(id) {
      if (!GLOBAL_SCRIPT_SETUP_ID_REGEX.test(id)) return
      return loadGlobalScriptSetup(id, globalScriptSetupContext)
    },

    transform(code, id) {
      try {
        if (filter(id)) {
          return transformVueSFC(code, id, options)
        } else if (filterGlobalScriptSetup?.(id)) {
          return transformGlobalScriptSetup(code, id, globalScriptSetupContext)
        }
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },
  }
})
