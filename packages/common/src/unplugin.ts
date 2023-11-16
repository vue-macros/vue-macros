import {
  type FilterPattern,
  createFilter as createRollupFilter,
} from '@rollup/pluginutils'
import { generateTransform } from 'magic-string-ast'
import type { ResolvedOptions } from '@vitejs/plugin-vue'
import type { Plugin } from 'rollup'
import type { Plugin as VitePlugin } from 'vite'

/** @deprecated use `generateTransform` instead */
export const getTransformResult = generateTransform

export interface BaseOptions {
  include?: FilterPattern
  exclude?: FilterPattern
  version?: number
}

export function createFilter(options: BaseOptions) {
  return createRollupFilter(options.include, options.exclude)
}

export { normalizePath } from '@rollup/pluginutils'

export interface VuePluginApi {
  options: ResolvedOptions
  version: string
}

const VUE3_PLUGINS = ['vite:vue', 'unplugin-vue']
const VUE2_PLUGINS = ['vite:vue2', 'unplugin-vue2']

export function getVuePluginApi(
  plugins: Readonly<(Plugin | VitePlugin)[]> | undefined,
): VuePluginApi | null {
  const vuePlugin = (plugins || []).find((p) =>
    [...VUE3_PLUGINS, ...VUE2_PLUGINS].includes(p.name),
  )
  if (!vuePlugin)
    throw new Error(
      'Cannot find Vue plugin (@vitejs/plugin-vue or unplugin-vue). Please make sure to add it before using Vue Macros.',
    )

  if (VUE2_PLUGINS.includes(vuePlugin.name)) {
    return null
  }

  const api = vuePlugin.api as VuePluginApi
  if (!api?.version) {
    throw new Error(
      'The Vue plugin is not supported (@vitejs/plugin-vue or unplugin-vue). Please make sure version > 4.3.4.',
    )
  }

  return api
}
