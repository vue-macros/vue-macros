import { createCombinePlugin } from 'unplugin-combine'
import VueBetterDefine from '@vue-macros/better-define'
import VueDefineModel from '@vue-macros/define-model'
import VueDefineOptions from 'unplugin-vue-define-options'
import VueDefineProps from '@vue-macros/define-props'
import VueDefineRender from '@vue-macros/define-render'
import VueDefineSlots from '@vue-macros/define-slots'
import VueExportProps from '@vue-macros/export-props'
import VueHoistStatic from '@vue-macros/hoist-static'
import VueNamedTemplate from '@vue-macros/named-template'
import VueReactivityTransformVue2 from '@vue-macros/reactivity-transform-vue2'
import VueSetupBlock from '@vue-macros/setup-block'
import VueSetupComponent from '@vue-macros/setup-component'
import VueSetupSFC from '@vue-macros/setup-sfc'
import VueShortEmits from '@vue-macros/short-emits'
import { detectVueVersion } from '@vue-macros/common'

import type { UnpluginInstance } from 'unplugin'
import type { OptionsPlugin, Plugin, PluginType } from 'unplugin-combine'
import type { Options as OptionsBetterDefine } from '@vue-macros/better-define'
import type { Options as OptionsDefineModel } from '@vue-macros/define-model'
import type { Options as OptionsDefineOptions } from 'unplugin-vue-define-options'
import type { Options as OptionsDefineProps } from '@vue-macros/define-props'
import type { Options as OptionsDefineRender } from '@vue-macros/define-render'
import type { Options as OptionsDefineSlots } from '@vue-macros/define-slots'
import type { Options as OptionsExportProps } from '@vue-macros/export-props'
import type { Options as OptionsHoistStatic } from '@vue-macros/hoist-static'
import type { Options as OptionsNamedTemplate } from '@vue-macros/named-template'
import type { Options as OptionsReactivityTransformVue2 } from '@vue-macros/reactivity-transform-vue2'
import type { Options as OptionsSetupBlock } from '@vue-macros/setup-block'
import type { Options as OptionsSetupComponent } from '@vue-macros/setup-component'
import type { Options as OptionsSetupSFC } from '@vue-macros/setup-sfc'
import type { Options as OptionsShortEmits } from '@vue-macros/short-emits'

export interface FeatureOptionsMap {
  betterDefine: OptionsBetterDefine
  defineModel: OptionsDefineModel
  defineOptions: OptionsDefineOptions
  defineProps: OptionsDefineProps
  defineRender: OptionsDefineRender
  defineSlots: OptionsDefineSlots
  exportProps: OptionsExportProps
  hoistStatic: OptionsHoistStatic
  namedTemplate: OptionsNamedTemplate
  reactivityTransformVue2: OptionsReactivityTransformVue2
  setupBlock: OptionsSetupBlock
  setupComponent: OptionsSetupComponent
  setupSFC: OptionsSetupSFC
  shortEmits: OptionsShortEmits
}
export type FeatureName = keyof FeatureOptionsMap
export type FeatureOptions = FeatureOptionsMap[FeatureName]

export interface OptionsCommon {
  root?: string
  version?: 2 | 3
  isProduction?: boolean
  plugins?: {
    vue?: any
    vueJsx?: any
  }
}

type OptionalSubOptions<T> = boolean | Omit<T, keyof OptionsCommon> | undefined

export type Options = OptionsCommon & {
  [K in FeatureName]?: OptionalSubOptions<FeatureOptionsMap[K]>
}

export type OptionsResolved = Pick<Required<OptionsCommon>, 'plugins'> & {
  [K in FeatureName]: false | FeatureOptionsMap[K]
}

function resolveOptions({
  root,
  version,
  plugins,
  isProduction,
  betterDefine,
  defineModel,
  defineOptions,
  defineProps,
  defineRender,
  defineSlots,
  exportProps,
  hoistStatic,
  namedTemplate,
  reactivityTransformVue2,
  setupBlock,
  setupComponent,
  setupSFC,
  shortEmits,
}: Options): OptionsResolved {
  function resolveSubOptions<K extends FeatureName>(
    options: OptionalSubOptions<FeatureOptionsMap[K]>,
    commonOptions: Partial<
      Pick<OptionsCommon, keyof OptionsCommon & keyof FeatureOptionsMap[K]>
    > = {},
    defaultEnabled = true
  ): FeatureOptionsMap[K] | false {
    options = options ?? defaultEnabled
    if (!options) return false
    else if (options === true) return { ...commonOptions }
    else return { ...options, ...commonOptions }
  }

  root = root || process.cwd()
  version = version || detectVueVersion()
  isProduction = isProduction ?? process.env.NODE_ENV === 'production'

  return {
    plugins: plugins || {},

    betterDefine: resolveSubOptions<'betterDefine'>(betterDefine, {
      isProduction,
    }),
    defineModel: resolveSubOptions<'defineModel'>(defineModel, { version }),
    defineOptions: resolveSubOptions<'defineOptions'>(defineOptions, {
      version,
    }),
    defineProps: resolveSubOptions<'defineProps'>(defineProps, { version }),
    defineRender: resolveSubOptions<'defineRender'>(defineRender),
    defineSlots: resolveSubOptions<'defineSlots'>(defineSlots, { version }),
    exportProps: resolveSubOptions<'exportProps'>(exportProps, { version }),
    hoistStatic: resolveSubOptions<'hoistStatic'>(hoistStatic),
    namedTemplate: resolveSubOptions<'namedTemplate'>(namedTemplate),
    reactivityTransformVue2: resolveSubOptions<'reactivityTransformVue2'>(
      reactivityTransformVue2,
      undefined,
      version === 2
    ),
    setupBlock: resolveSubOptions<'setupBlock'>(setupBlock, undefined, false),
    setupComponent: resolveSubOptions<'setupComponent'>(setupComponent, {
      root,
    }),
    setupSFC: resolveSubOptions<'setupSFC'>(setupSFC),
    shortEmits: resolveSubOptions<'shortEmits'>(shortEmits),
  }
}

function resolvePlugin(
  unplugin: UnpluginInstance<any, true>,
  framework: PluginType,
  options: FeatureOptions | false
): Plugin[] | undefined

function resolvePlugin(
  unplugin: UnpluginInstance<any, false>,
  framework: PluginType,
  options: FeatureOptions | false
): Plugin | undefined

function resolvePlugin(
  unplugin: UnpluginInstance<any, boolean>,
  framework: PluginType,
  options: FeatureOptions | false
): Plugin | Plugin[] | undefined {
  if (!options) return
  return unplugin[framework!](options)
}

const name = 'unplugin-vue-macros'

export default createCombinePlugin((userOptions: Options = {}, meta) => {
  const options = resolveOptions(userOptions)

  const framework = meta.framework!
  const setupComponentPlugins = resolvePlugin(
    VueSetupComponent,
    framework,
    options.setupComponent
  )
  const namedTemplatePlugins = resolvePlugin(
    VueNamedTemplate,
    framework,
    options.namedTemplate
  )

  const plugins: OptionsPlugin[] = [
    resolvePlugin(VueSetupSFC, framework, options.setupSFC),
    setupComponentPlugins?.[0],
    resolvePlugin(VueSetupBlock, framework, options.setupBlock),
    resolvePlugin(VueHoistStatic, framework, options.hoistStatic),
    namedTemplatePlugins?.[0],
    resolvePlugin(VueDefineProps, framework, options.defineProps),
    resolvePlugin(VueExportProps, framework, options.exportProps),
    resolvePlugin(VueShortEmits, framework, options.shortEmits),
    resolvePlugin(VueDefineModel, framework, options.defineModel),
    resolvePlugin(VueDefineSlots, framework, options.defineSlots),
    resolvePlugin(
      VueReactivityTransformVue2,
      framework,
      options.reactivityTransformVue2
    ),
    resolvePlugin(VueBetterDefine, framework, options.betterDefine),
    resolvePlugin(VueDefineOptions, framework, options.defineOptions),
    options.plugins.vue,
    options.plugins.vueJsx,
    resolvePlugin(VueDefineRender, framework, options.defineRender),
    setupComponentPlugins?.[1],
    namedTemplatePlugins?.[1],
  ].filter(Boolean)

  return {
    name,
    plugins,
  }
})
