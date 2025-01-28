import { createUnplugin, type UnpluginInstance } from 'unplugin'
import transformJsxDirective, { type Options } from './api'

export { type Options }

const plugin: UnpluginInstance<Options | undefined, false> = createUnplugin(
  transformJsxDirective,
)
export default plugin
