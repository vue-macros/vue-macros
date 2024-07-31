/* eslint perfectionist/sort-imports: ["error", {
  customGroups: {
    "value": {
      "vue-macros": ["@vue-macros/**", "unplugin-vue-define-options"]
    },
  },
  groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'vue-macros'],
  internalPattern: ['#**'],
  newlinesBetween: 'ignore',
}] */
/* eslint perfectionist/sort-interfaces: ["error", { ignorePattern: ["OptionsCommon"] }] */
/* eslint perfectionist/sort-objects: ["error", { partitionByNewLine: true }] */

import process from 'node:process'
import { loadConfig } from './config'

import type { Options as OptionsBetterDefine } from '@vue-macros/better-define'
import type { Options as OptionsBooleanProp } from '@vue-macros/boolean-prop'
import type { Options as OptionsChainCall } from '@vue-macros/chain-call'
import {
  detectVueVersion,
  type BaseOptions,
  type FilterOptions,
} from '@vue-macros/common'
import type { Options as OptionsDefineEmit } from '@vue-macros/define-emit'
import type { Options as OptionsDefineModels } from '@vue-macros/define-models'
import type { Options as OptionsDefineProp } from '@vue-macros/define-prop'
import type { Options as OptionsDefineProps } from '@vue-macros/define-props'
import type { Options as OptionsDefinePropsRefs } from '@vue-macros/define-props-refs'
import type { Options as OptionsDefineRender } from '@vue-macros/define-render'
import type { Options as OptionsDefineSlots } from '@vue-macros/define-slots'
import type { Options as OptionsExportExpose } from '@vue-macros/export-expose'
import type { Options as OptionsExportProps } from '@vue-macros/export-props'
import type { Options as OptionsExportRender } from '@vue-macros/export-render'
import type { Options as OptionsHoistStatic } from '@vue-macros/hoist-static'
import type { Options as OptionsJsxDirective } from '@vue-macros/jsx-directive'
import type { Options as OptionsNamedTemplate } from '@vue-macros/named-template'
import type { Options as OptionsReactivityTransform } from '@vue-macros/reactivity-transform'
import type { Options as OptionsScriptLang } from '@vue-macros/script-lang'
import type { Options as OptionsSetupBlock } from '@vue-macros/setup-block'
import type { Options as OptionsSetupComponent } from '@vue-macros/setup-component'
import type { Options as OptionsSetupSFC } from '@vue-macros/setup-sfc'
import type { Options as OptionsShortBind } from '@vue-macros/short-bind'
import type { Options as OptionsShortEmits } from '@vue-macros/short-emits'
import type { Options as OptionsShortVmodel } from '@vue-macros/short-vmodel'
import type { Options as OptionsDefineOptions } from 'unplugin-vue-define-options'

export interface OptionsCommon extends Omit<BaseOptions, keyof FilterOptions> {
  root?: string
  plugins?: {
    vue?: any
    vueJsx?: any
    vueRouter?: any
  }
  /** @internal */
  nuxtContext?: {
    isClient?: boolean
  }
}

export interface FeatureOptionsMap {
  betterDefine: OptionsBetterDefine
  booleanProp: OptionsBooleanProp
  chainCall: OptionsChainCall
  defineEmit: OptionsDefineEmit
  defineGeneric: FilterOptions
  defineModels: OptionsDefineModels
  defineOptions: OptionsDefineOptions
  defineProp: OptionsDefineProp
  defineProps: OptionsDefineProps
  definePropsRefs: OptionsDefinePropsRefs
  defineRender: OptionsDefineRender
  defineSlots: OptionsDefineSlots
  exportExpose: OptionsExportExpose
  exportProps: OptionsExportProps
  exportRender: OptionsExportRender
  hoistStatic: OptionsHoistStatic
  jsxDirective: OptionsJsxDirective
  namedTemplate: OptionsNamedTemplate
  reactivityTransform: OptionsReactivityTransform
  scriptLang: OptionsScriptLang
  setupBlock: OptionsSetupBlock
  setupComponent: OptionsSetupComponent
  setupJsdoc: FilterOptions
  setupSFC: OptionsSetupSFC
  shortBind: OptionsShortBind
  shortEmits: OptionsShortEmits
  shortVmodel: OptionsShortVmodel
  templateRef: FilterOptions & { alias?: string[] }
}
export type FeatureName = keyof FeatureOptionsMap
export type FeatureOptions = FeatureOptionsMap[FeatureName]

type OptionalSubOptions<T> = boolean | Omit<T, keyof OptionsCommon> | undefined
export type Options = OptionsCommon & {
  [K in FeatureName]?: OptionalSubOptions<FeatureOptionsMap[K]>
}

export type OptionsResolved = Required<OptionsCommon> & {
  [K in FeatureName]: false | FeatureOptionsMap[K]
}

export function resolveOptions(
  options?: Options,
  cwd: string = process.cwd(),
): OptionsResolved {
  const config = loadConfig(cwd)

  let { isProduction, nuxtContext, plugins, root, version, ...subOptions } = {
    ...config,
    ...options,
  }

  root = root || cwd
  version = version || detectVueVersion(root)
  isProduction = isProduction ?? process.env.NODE_ENV === 'production'

  const globalOptions = { isProduction, root, version }
  return {
    isProduction,
    nuxtContext: nuxtContext || {},
    plugins: plugins || {},
    root,
    version,

    betterDefine: resolveSubOptions('betterDefine'),
    booleanProp: resolveSubOptions('booleanProp', false),
    chainCall: resolveSubOptions('chainCall'),
    defineEmit: resolveSubOptions('defineEmit'),
    defineGeneric: resolveSubOptions('defineGeneric'),
    defineModels: resolveSubOptions('defineModels'),
    defineOptions: resolveSubOptions('defineOptions', 3.3),
    defineProp: resolveSubOptions('defineProp'),
    defineProps: resolveSubOptions('defineProps'),
    definePropsRefs: resolveSubOptions('definePropsRefs'),
    defineRender: resolveSubOptions('defineRender'),
    defineSlots: resolveSubOptions('defineSlots', 3.3),
    exportExpose: resolveSubOptions('exportExpose', false),
    exportProps: resolveSubOptions('exportProps', false),
    exportRender: resolveSubOptions('exportRender', false),
    hoistStatic: resolveSubOptions('hoistStatic'),
    jsxDirective: resolveSubOptions('jsxDirective'),
    namedTemplate: resolveSubOptions('namedTemplate'),
    reactivityTransform: resolveSubOptions('reactivityTransform'),
    scriptLang: resolveSubOptions('scriptLang', false),
    setupBlock: resolveSubOptions('setupBlock', false),
    setupComponent: resolveSubOptions('setupComponent'),
    setupJsdoc: resolveSubOptions('setupJsdoc'),
    setupSFC: resolveSubOptions('setupSFC', false),
    shortBind: resolveSubOptions('shortBind'),
    shortEmits: resolveSubOptions('shortEmits', 3.3),
    shortVmodel: resolveSubOptions('shortVmodel'),
    templateRef: resolveSubOptions('templateRef'),
  }

  function resolveSubOptions<K extends FeatureName>(
    name: K,
    belowVersion: boolean | number = true,
  ): FeatureOptionsMap[K] | false {
    const defaultEnabled =
      typeof belowVersion === 'boolean' ? belowVersion : version! < belowVersion
    const options: OptionalSubOptions<FeatureOptionsMap[K]> =
      subOptions[name] ?? defaultEnabled
    if (!options) return false
    return {
      ...globalOptions,
      ...(options === true ? {} : options),
    }
  }
}
