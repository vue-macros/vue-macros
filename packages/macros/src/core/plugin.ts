import type { FeatureOptions } from '@vue-macros/config'
import type { UnpluginInstance } from 'unplugin'
import type { Plugin, PluginType } from 'unplugin-combine'

export function resolvePlugin(
  unplugin: UnpluginInstance<any, true>,
  framework: PluginType,
  options: FeatureOptions | false,
): Plugin[] | undefined

export function resolvePlugin(
  unplugin: UnpluginInstance<any, false>,
  framework: PluginType,
  options: FeatureOptions | false,
): Plugin | undefined

export function resolvePlugin(
  unplugin: UnpluginInstance<any, boolean>,
  framework: PluginType,
  options: FeatureOptions | false,
): Plugin | Plugin[] | undefined {
  if (!options) return
  return unplugin[framework!](options)
}
