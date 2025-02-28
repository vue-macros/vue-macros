import jsxDirective from '@vue-macros/jsx-directive'
import jsxMacros from '@vue-macros/jsx-macros'

import { generatePluginName } from '#macros' with { type: 'macro' }
import {
  createCombinePlugin,
  type UnpluginCombineInstance,
} from 'unplugin-combine'
import { resolveJSXOptions, type JSXOptions } from './options'

const name = generatePluginName()
const plugin: UnpluginCombineInstance<JSXOptions | undefined> =
  createCombinePlugin<JSXOptions | undefined>((userOptions = {}, meta) => {
    const options = resolveJSXOptions(userOptions)
    const framework = meta.framework!
    const plugins = [
      options.directive
        ? jsxDirective[framework](options.directive)
        : undefined,
      options.macros ? jsxMacros[framework](options.macros) : undefined,
    ].filter((plugin) => !!plugin)

    return {
      name,
      plugins,
    }
  })

export default plugin
