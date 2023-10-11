import {
  type OptionsPlugin,
  type Plugin,
  type PluginType,
  createCombinePlugin,
} from 'unplugin-combine'

import { detectVueVersion } from '@vue-macros/common'
import { Devtools } from '@vue-macros/devtools'

import VueBetterDefine, {
  type Options as OptionsBetterDefine,
} from '@vue-macros/better-define'
import VueBooleanProp, {
  type Options as OptionsBooleanProp,
} from '@vue-macros/boolean-prop'
import VueChainCall, {
  type Options as OptionsChainCall,
} from '@vue-macros/chain-call'
import VueDefineEmit, {
  type Options as OptionsDefineEmit,
} from '@vue-macros/define-emit'
import VueDefineModels, {
  type Options as OptionsDefineModels,
} from '@vue-macros/define-models'
import VueDefineOptions, {
  type Options as OptionsDefineOptions,
} from 'unplugin-vue-define-options'
import VueDefineProp, {
  type Options as OptionsDefineProp,
} from '@vue-macros/define-prop'
import VueDefineProps, {
  type Options as OptionsDefineProps,
} from '@vue-macros/define-props'
import VueDefinePropsRefs, {
  type Options as OptionsDefinePropsRefs,
} from '@vue-macros/define-props-refs'
import VueDefineRender, {
  type Options as OptionsDefineRender,
} from '@vue-macros/define-render'
import VueDefineSlots, {
  type Options as OptionsDefineSlots,
} from '@vue-macros/define-slots'
import VueExportExpose, {
  type Options as OptionsExportExpose,
} from '@vue-macros/export-expose'
import VueExportProps, {
  type Options as OptionsExportProps,
} from '@vue-macros/export-props'
import VueExportRender, {
  type Options as OptionsExportRender,
} from '@vue-macros/export-render'
import VueHoistStatic, {
  type Options as OptionsHoistStatic,
} from '@vue-macros/hoist-static'
import VueJsxDirective, {
  type Options as OptionsJsxDirective,
} from '@vue-macros/jsx-directive'
import VueNamedTemplate, {
  type Options as OptionsNamedTemplate,
} from '@vue-macros/named-template'
import VueReactivityTransform, {
  type Options as OptionsReactivityTransform,
} from '@vue-macros/reactivity-transform'
import VueSetupBlock, {
  type Options as OptionsSetupBlock,
} from '@vue-macros/setup-block'
import VueSetupComponent, {
  type Options as OptionsSetupComponent,
} from '@vue-macros/setup-component'
import VueSetupSFC, {
  type Options as OptionsSetupSFC,
} from '@vue-macros/setup-sfc'
import VueShortBind, {
  type Options as OptionsShortBind,
} from '@vue-macros/short-bind'
import VueShortEmits, {
  type Options as OptionsShortEmits,
} from '@vue-macros/short-emits'
import VueShortVmodel, {
  type Options as OptionsShortVmodel,
} from '@vue-macros/short-vmodel'

import { generatePluginName } from '#macros' assert { type: 'macro' }
import { excludeDepOptimize } from './core'
import type { UnpluginInstance } from 'unplugin'

export interface FeatureOptionsMap {
  betterDefine: OptionsBetterDefine
  booleanProp: OptionsBooleanProp
  chainCall: OptionsChainCall
  defineEmit: OptionsDefineEmit
  defineModels: OptionsDefineModels
  defineOptions: OptionsDefineOptions
  defineProp: OptionsDefineProp
  defineProps: OptionsDefineProps
  definePropsRefs: OptionsDefinePropsRefs
  defineRender: OptionsDefineRender
  defineSlots: OptionsDefineSlots
  exportRender: OptionsExportRender
  exportExpose: OptionsExportExpose
  exportProps: OptionsExportProps
  hoistStatic: OptionsHoistStatic
  jsxDirective: OptionsJsxDirective
  namedTemplate: OptionsNamedTemplate
  reactivityTransform: OptionsReactivityTransform
  setupBlock: OptionsSetupBlock
  setupComponent: OptionsSetupComponent
  setupSFC: OptionsSetupSFC
  shortBind: OptionsShortBind
  shortEmits: OptionsShortEmits
  shortVmodel: OptionsShortVmodel
}
export type FeatureName = keyof FeatureOptionsMap
export type FeatureOptions = FeatureOptionsMap[FeatureName]

export interface OptionsCommon {
  root?: string
  version?: number
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

export function resolveOptions({
  root,
  version,
  plugins,
  isProduction,
  nuxtContext,

  betterDefine,
  booleanProp,
  chainCall,
  defineEmit,
  defineModels,
  defineOptions,
  defineProp,
  defineProps,
  definePropsRefs,
  defineRender,
  defineSlots,
  exportRender,
  exportExpose,
  exportProps,
  hoistStatic,
  jsxDirective,
  namedTemplate,
  reactivityTransform,
  setupBlock,
  setupComponent,
  setupSFC,
  shortBind,
  shortEmits,
  shortVmodel,
}: Options): OptionsResolved {
  function resolveSubOptions<K extends FeatureName>(
    options: OptionalSubOptions<FeatureOptionsMap[K]>,
    commonOptions: Required<
      Pick<OptionsCommon, keyof OptionsCommon & keyof FeatureOptionsMap[K]>
    >,
    defaultEnabled = true
  ): FeatureOptionsMap[K] | false {
    options = options ?? defaultEnabled
    if (!options) return false
    return { ...(options === true ? {} : options), ...commonOptions }
  }

  root = root || process.cwd()
  version = version || detectVueVersion(root)
  isProduction = isProduction ?? process.env.NODE_ENV === 'production'

  return {
    plugins: plugins || {},
    root,
    version,
    isProduction,
    nuxtContext: nuxtContext || {},

    betterDefine: resolveSubOptions<'betterDefine'>(betterDefine, {
      version,
      isProduction,
    }),
    booleanProp: resolveSubOptions<'booleanProp'>(
      booleanProp,
      { version },
      false
    ),
    chainCall: resolveSubOptions<'chainCall'>(chainCall, { version }),
    defineEmit: resolveSubOptions<'defineEmit'>(defineEmit, {
      isProduction,
      version,
    }),
    defineModels: resolveSubOptions<'defineModels'>(defineModels, { version }),
    defineOptions: resolveSubOptions<'defineOptions'>(
      defineOptions,
      { version },
      version < 3.3
    ),
    defineProp: resolveSubOptions<'defineProp'>(defineProp, {
      isProduction,
      version,
    }),
    defineProps: resolveSubOptions<'defineProps'>(defineProps, { version }),
    definePropsRefs: resolveSubOptions<'definePropsRefs'>(definePropsRefs, {
      version,
    }),
    defineRender: resolveSubOptions<'defineRender'>(defineRender, { version }),
    defineSlots: resolveSubOptions<'defineSlots'>(
      defineSlots,
      { version },
      version < 3.3
    ),
    exportExpose: resolveSubOptions<'exportExpose'>(
      exportExpose,
      { version },
      false
    ),
    exportRender: resolveSubOptions<'exportRender'>(
      exportRender,
      { version },
      false
    ),
    exportProps: resolveSubOptions<'exportProps'>(
      exportProps,
      { version },
      false
    ),
    jsxDirective: resolveSubOptions<'jsxDirective'>(jsxDirective, {
      version,
    }),
    hoistStatic: resolveSubOptions<'hoistStatic'>(hoistStatic, { version }),
    namedTemplate: resolveSubOptions<'namedTemplate'>(namedTemplate, {
      version,
    }),
    reactivityTransform: resolveSubOptions<'reactivityTransform'>(
      reactivityTransform,
      { version }
    ),
    setupBlock: resolveSubOptions<'setupBlock'>(setupBlock, { version }, false),
    setupComponent: resolveSubOptions<'setupComponent'>(setupComponent, {
      version,
      root,
    }),
    setupSFC: resolveSubOptions<'setupSFC'>(setupSFC, { version }, false),
    shortBind: resolveSubOptions<'shortBind'>(shortBind, { version }, false),
    shortEmits: resolveSubOptions<'shortEmits'>(
      shortEmits,
      { version },
      version < 3.3
    ),
    shortVmodel: resolveSubOptions<'shortVmodel'>(shortVmodel, { version }),
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

const name = generatePluginName()
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

      // props
      resolvePlugin(VueChainCall, framework, options.chainCall),
      resolvePlugin(VueDefineProps, framework, options.defineProps),
      resolvePlugin(VueDefinePropsRefs, framework, options.definePropsRefs),
      resolvePlugin(VueExportProps, framework, options.exportProps),

      // emits
      resolvePlugin(VueDefineEmit, framework, options.defineEmit),
      resolvePlugin(VueShortEmits, framework, options.shortEmits),

      // both props & emits
      resolvePlugin(VueDefineModels, framework, options.defineModels),

      // convert to runtime props & emits
      resolvePlugin(VueBetterDefine, framework, options.betterDefine),

      // runtime props
      resolvePlugin(VueDefineProp, framework, options.defineProp),

      resolvePlugin(VueDefineSlots, framework, options.defineSlots),
      resolvePlugin(VueExportRender, framework, options.exportRender),
      resolvePlugin(VueExportExpose, framework, options.exportExpose),
      resolvePlugin(
        VueReactivityTransform,
        framework,
        options.reactivityTransform
      ),
      resolvePlugin(VueHoistStatic, framework, options.hoistStatic),
      resolvePlugin(VueDefineOptions, framework, options.defineOptions),
      resolvePlugin(VueJsxDirective, framework, options.jsxDirective),

      ...(framework === 'vite' || framework === 'rollup'
        ? [
            resolvePlugin(
              // VueBooleanProp is not an unplugin, by now
              VueBooleanProp as any,
              framework,
              options.booleanProp
            ),
            resolvePlugin(
              // VueShortBind is not an unplugin, by now
              VueShortBind as any,
              framework,
              options.shortBind
            ),
            resolvePlugin(
              // VueShortVmodel is not an unplugin, by now
              VueShortVmodel as any,
              framework,
              options.shortVmodel
            ),
          ]
        : []),

      options.plugins.vue,
      options.plugins.vueJsx,
      resolvePlugin(VueDefineRender, framework, options.defineRender),
      setupComponentPlugins?.[1],
      namedTemplatePlugins?.[1],
      framework === 'vite'
        ? Devtools({ nuxtContext: options.nuxtContext })
        : undefined,
      framework === 'vite' ? excludeDepOptimize() : undefined,
    ].filter(Boolean)

    return {
      name,
      plugins,
    }
  }
)
