import {
  type FilterPattern,
  createFilter as createRollupFilter,
} from '@rollup/pluginutils'
import { generateTransform } from 'magic-string-ast'
import { type ResolvedOptions } from '@vitejs/plugin-vue'
import { type Plugin } from 'rollup'
import { type Plugin as VitePlugin } from 'vite'

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

export function getVuePluginApi(
  plugins: Readonly<(Plugin | VitePlugin)[]> | undefined
): VuePluginApi {
  const vuePlugin = (plugins || []).find(
    (p) => p.name === 'vite:vue' || p.name === 'unplugin-vue'
  )
  if (!vuePlugin) {
    throw new Error(
      'Cannot find Vue plugin (@vitejs/plugin-vue or unplugin-vue). Please make sure to add it before using Vue Macros.'
    )
  }

  const api = vuePlugin.api as VuePluginApi
  if (!api?.version) {
    throw new Error(
      'The Vue plugin is not supported (@vitejs/plugin-vue or unplugin-vue). Please make sure version > 4.3.4.'
    )
  }

  return api
}
