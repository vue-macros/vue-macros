import {
  type FilterPattern,
  createFilter as createRollupFilter,
} from '@rollup/pluginutils'
import { generateTransform } from 'magic-string-ast'
import {
  REGEX_SETUP_SFC,
  REGEX_SRC_FILE,
  REGEX_VUE_SFC,
  REGEX_VUE_SUB,
  REGEX_VUE_SUB_SETUP,
} from './constants'
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

export {
  normalizePath,
  createFilter as createRollupFilter,
} from '@rollup/pluginutils'

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

export enum FilterFileType {
  /** Vue SFC */
  VUE_SFC,
  /** Vue SFC with `<script setup>` */
  VUE_SFC_WITH_SETUP,
  /** foo.setup.tsx */
  SETUP_SFC,
  /** Source files */
  SRC_FILE,
}

export function getFilterPattern(
  types: FilterFileType[],
  framework?: string,
): RegExp[] {
  const filter: RegExp[] = []
  const isWebpackLike = framework === 'webpack' || framework === 'rspack'
  if (types.includes(FilterFileType.VUE_SFC)) {
    filter.push(isWebpackLike ? REGEX_VUE_SUB : REGEX_VUE_SFC)
  }
  if (types.includes(FilterFileType.VUE_SFC_WITH_SETUP)) {
    filter.push(isWebpackLike ? REGEX_VUE_SUB_SETUP : REGEX_VUE_SFC)
  }
  if (types.includes(FilterFileType.SETUP_SFC)) {
    filter.push(REGEX_SETUP_SFC)
  }
  if (types.includes(FilterFileType.SRC_FILE)) {
    filter.push(REGEX_SRC_FILE)
  }
  return filter
}
