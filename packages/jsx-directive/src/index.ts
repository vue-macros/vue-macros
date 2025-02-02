import { createUnplugin, type UnpluginInstance } from 'unplugin'
import plugin, { type Options, type OptionsResolved } from './plugin'

export type { Options, OptionsResolved }

export default createUnplugin(plugin) as UnpluginInstance<
  Options | undefined,
  false
>
