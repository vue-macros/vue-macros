import { createCombinePlugin } from 'unplugin-combine'
import VueBetterDefine from '@vue-macros/better-define'
import VueDefineModel from '@vue-macros/define-model'
import VueDefineOptions from 'unplugin-vue-define-options'
import VueDefineRender from '@vue-macros/define-render'
import VueDefineSlots from '@vue-macros/define-slots'
import VueHoistStatic from '@vue-macros/hoist-static'
import VueNamedTemplate from '@vue-macros/named-template'
import VueSetupComponent from '@vue-macros/setup-component'
import VueSetupSFC from '@vue-macros/setup-sfc'
import VueShortEmits from '@vue-macros/short-emits'

import { getVueVersion } from './utils'
import type { UnpluginInstance } from 'unplugin'
import type {
  OptionsPlugin,
  Unplugin,
  UnpluginCombineInstance,
} from 'unplugin-combine'
import type { Options as OptionsBetterDefine } from '@vue-macros/better-define'
import type { Options as OptionsDefineModel } from '@vue-macros/define-model'
import type { Options as OptionsDefineOptions } from 'unplugin-vue-define-options'
import type { Options as OptionsDefineRender } from '@vue-macros/define-render'
import type { Options as OptionsDefineSlots } from '@vue-macros/define-slots'
import type { Options as OptionsHoistStatic } from '@vue-macros/hoist-static'
import type { Options as OptionsNamedTemplate } from '@vue-macros/named-template'
import type { Options as OptionsSetupComponent } from '@vue-macros/setup-component'
import type { Options as OptionsSetupSFC } from '@vue-macros/setup-sfc'
import type { Options as OptionsShortEmits } from '@vue-macros/short-emits'

export interface FeatureOptionsMap {
  betterDefine: OptionsBetterDefine
  defineModel: OptionsDefineModel
  defineOptions: OptionsDefineOptions
  defineRender: OptionsDefineRender
  defineSlots: OptionsDefineSlots
  hoistStatic: OptionsHoistStatic
  namedTemplate: OptionsNamedTemplate
  setupComponent: OptionsSetupComponent
  setupSFC: OptionsSetupSFC
  shortEmits: OptionsShortEmits
}
export type FeatureName = keyof FeatureOptionsMap
export type FeatureOptions = FeatureOptionsMap[FeatureName]

export interface OptionsCommon {
  root?: string
  version?: 2 | 3
  plugins?: {
    vue?: any
    vueJsx?: any
  }
}

type OptionalSubOptions<T> = boolean | Omit<T, keyof OptionsCommon> | undefined

export type Options = OptionsCommon & {
  [K in FeatureName]?: OptionalSubOptions<FeatureOptionsMap[K]>
}

export type OptionsResolved = Required<OptionsCommon> & {
  [K in FeatureName]: false | FeatureOptionsMap[K]
}

function resolveOptions({
  root,
  version,
  plugins,
  betterDefine,
  defineModel,
  defineOptions,
  defineRender,
  defineSlots,
  hoistStatic,
  namedTemplate,
  setupComponent,
  setupSFC,
  shortEmits,
}: Options): OptionsResolved {
  function resolveSubOptions<K extends FeatureName>(
    options: OptionalSubOptions<FeatureOptionsMap[K]>,
    commonOptions: Partial<
      Pick<OptionsCommon, keyof OptionsCommon & keyof FeatureOptionsMap[K]>
    > = {}
  ): FeatureOptionsMap[K] | false {
    if (options === false) return false
    else if (options === true || options === undefined)
      return { ...commonOptions }
    else return { ...options, ...commonOptions }
  }

  return {
    root: root || process.cwd(),
    version: version || getVueVersion(),
    plugins: plugins || {},

    betterDefine: resolveSubOptions<'betterDefine'>(betterDefine, { version }),
    defineModel: resolveSubOptions<'defineModel'>(defineModel, { version }),
    defineOptions: resolveSubOptions<'defineOptions'>(defineOptions),
    defineRender: resolveSubOptions<'defineRender'>(defineRender),
    defineSlots: resolveSubOptions<'defineSlots'>(defineSlots),
    hoistStatic: resolveSubOptions<'hoistStatic'>(hoistStatic),
    namedTemplate: resolveSubOptions<'namedTemplate'>(namedTemplate),
    setupComponent: resolveSubOptions<'setupComponent'>(setupComponent, {
      root,
    }),
    setupSFC: resolveSubOptions<'setupSFC'>(setupSFC),
    shortEmits: resolveSubOptions<'shortEmits'>(shortEmits),
  }
}

function resolvePlugin(
  options: FeatureOptions | false,
  unplugin: UnpluginCombineInstance<any>,
  index: number
): Unplugin<any> | undefined
function resolvePlugin(
  options: FeatureOptions | false,
  unplugin: UnpluginInstance<any, false>
): Unplugin<any> | undefined
function resolvePlugin(
  options: FeatureOptions | false,
  unplugin: UnpluginInstance<any, false> | UnpluginCombineInstance<any>,
  idx?: number
): Unplugin<any> | undefined {
  if (!options) return
  if ('plugins' in unplugin) {
    return ((unplugin.plugins as any)(options) as Unplugin<any>)[idx!]
  }
  return [unplugin, options]
}

const name = 'unplugin-vue-macros'

export default createCombinePlugin((userOptions: Options = {}) => {
  const options = resolveOptions(userOptions)

  const plugins: OptionsPlugin[] = [
    resolvePlugin(options.setupSFC, VueSetupSFC),
    resolvePlugin(options.setupComponent, VueSetupComponent, 0),
    resolvePlugin(options.hoistStatic, VueHoistStatic),
    resolvePlugin(options.namedTemplate, VueNamedTemplate, 0),
    resolvePlugin(options.shortEmits, VueShortEmits),
    resolvePlugin(options.defineOptions, VueDefineOptions),
    resolvePlugin(options.defineModel, VueDefineModel),
    resolvePlugin(options.defineSlots, VueDefineSlots),
    resolvePlugin(options.betterDefine, VueBetterDefine),
    options.plugins.vue,
    options.plugins.vueJsx,
    resolvePlugin(options.defineRender, VueDefineRender),
    resolvePlugin(options.setupComponent, VueSetupComponent, 1),
    resolvePlugin(options.namedTemplate, VueNamedTemplate, 1),
  ].filter(Boolean)

  return {
    name,
    plugins,
  }
})
