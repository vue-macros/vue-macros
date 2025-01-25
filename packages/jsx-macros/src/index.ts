import { createUnplugin, type UnpluginInstance } from 'unplugin'
import unplugin, { type Options } from './api'

export type { Options }

const plugin: UnpluginInstance<Options | undefined> = createUnplugin(unplugin)
export default plugin
