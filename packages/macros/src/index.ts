import { createCombinePlugin } from 'unplugin-combine'
import VueBetterDefine from '@vue-macros/better-define'
import VueDefineModel from '@vue-macros/define-model'
import VueDefineOptions from 'unplugin-vue-define-options'
import VueDefineProps from '@vue-macros/define-props'
import VueDefinePropsRefs from '@vue-macros/define-props-refs'
import VueDefineRender from '@vue-macros/define-render'
import VueDefineSlots from '@vue-macros/define-slots'
import VueExportProps from '@vue-macros/export-props'
import VueHoistStatic from '@vue-macros/hoist-static'
import VueNamedTemplate from '@vue-macros/named-template'
import VueReactivityTransform from '@vue-macros/reactivity-transform'
import VueSetupBlock from '@vue-macros/setup-block'
import VueSetupComponent from '@vue-macros/setup-component'
import VueSetupSFC from '@vue-macros/setup-sfc'
import VueShortEmits from '@vue-macros/short-emits'
import { detectVueVersion } from '@vue-macros/common'
import { Devtools } from '@vue-macros/devtools'

import type { UnpluginInstance } from 'unplugin'
import type { OptionsPlugin, Plugin, PluginType } from 'unplugin-combine'
import type { Options as OptionsBetterDefine } from '@vue-macros/better-define'
import type { Options as OptionsDefineModel } from '@vue-macros/define-model'
import type { Options as OptionsDefineOptions } from 'unplugin-vue-define-options'
import type { Options as OptionsDefineProps } from '@vue-macros/define-props'
import type { Options as OptionsDefinePropsRefs } from '@vue-macros/define-props-refs'
import type { Options as OptionsDefineRender } from '@vue-macros/define-render'
import type { Options as OptionsDefineSlots } from '@vue-macros/define-slots'
import type { Options as OptionsExportProps } from '@vue-macros/export-props'
import type { Options as OptionsHoistStatic } from '@vue-macros/hoist-static'
import type { Options as OptionsNamedTemplate } from '@vue-macros/named-template'
import type { Options as OptionsReactivityTransform } from '@vue-macros/reactivity-transform'
import type { Options as OptionsSetupBlock } from '@vue-macros/setup-block'
import type { Options as OptionsSetupComponent } from '@vue-macros/setup-component'
import type { Options as OptionsSetupSFC } from '@vue-macros/setup-sfc'
import type { Options as OptionsShortEmits } from '@vue-macros/short-emits'

export interface FeatureOptionsMap {
  betterDefine: OptionsBetterDefine
  defineModel: OptionsDefineModel
  defineOptions: OptionsDefineOptions
  defineProps: OptionsDefineProps
  definePropsRefs: OptionsDefinePropsRefs
  defineRender: OptionsDefineRender
  defineSlots: OptionsDefineSlots
  exportProps: OptionsExportProps
  hoistStatic: OptionsHoistStatic
  namedTemplate: OptionsNamedTemplate
  reactivityTransform: OptionsReactivityTransform
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
  /** @internal */
  nuxtContext?: {
    isClient?: boolean
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
  isProduction,
  nuxtContext,

  betterDefine,
  defineModel,
  defineOptions,
  defineProps,
  definePropsRefs,
  defineRender,
  defineSlots,
  exportProps,
  hoistStatic,
  namedTemplate,
  reactivityTransform,
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
    root,
    version,
    isProduction,
    nuxtContext: nuxtContext || {},

    betterDefine: resolveSubOptions<'betterDefine'>(betterDefine, {
      isProduction,
    }),
    defineModel: resolveSubOptions<'defineModel'>(defineModel, { version }),
    defineOptions: resolveSubOptions<'defineOptions'>(defineOptions, {
      version,
    }),
    defineProps: resolveSubOptions<'defineProps'>(defineProps, { version }),
    definePropsRefs: resolveSubOptions<'definePropsRefs'>(definePropsRefs, {
      version,
    }),
    defineRender: resolveSubOptions<'defineRender'>(defineRender),
    defineSlots: resolveSubOptions<'defineSlots'>(defineSlots, { version }),
    exportProps: resolveSubOptions<'exportProps'>(exportProps, { version }),
    hoistStatic: resolveSubOptions<'hoistStatic'>(hoistStatic),
    namedTemplate: resolveSubOptions<'namedTemplate'>(namedTemplate),
    reactivityTransform: resolveSubOptions<'reactivityTransform'>(
      reactivityTransform,
      undefined
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

export default createCombinePlugin<Options | undefined>(
  (userOptions = {}, meta) => {
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
      namedTemplatePlugins?.[0],
      resolvePlugin(VueDefineProps, framework, options.defineProps),
      resolvePlugin(VueDefinePropsRefs, framework, options.definePropsRefs),
      resolvePlugin(VueExportProps, framework, options.exportProps),
      resolvePlugin(VueShortEmits, framework, options.shortEmits),
      resolvePlugin(VueDefineModel, framework, options.defineModel),
      resolvePlugin(VueDefineSlots, framework, options.defineSlots),
      resolvePlugin(
        VueReactivityTransform,
        framework,
        options.reactivityTransform
      ),
      resolvePlugin(VueBetterDefine, framework, options.betterDefine),
      resolvePlugin(VueHoistStatic, framework, options.hoistStatic),
      resolvePlugin(VueDefineOptions, framework, options.defineOptions),
      options.plugins.vue,
      options.plugins.vueJsx,
      resolvePlugin(VueDefineRender, framework, options.defineRender),
      setupComponentPlugins?.[1],
      namedTemplatePlugins?.[1],
      framework === 'vite'
        ? Devtools({ nuxtContext: options.nuxtContext })
        : undefined,
    ].filter(Boolean)

    return {
      name,
      plugins,
    }
  }
)
