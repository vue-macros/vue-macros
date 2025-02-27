import VueJsxDirective from '@vue-macros/jsx-directive'
import VueJsxMacros from '@vue-macros/jsx-macros'

import { generatePluginName } from '#macros' with { type: 'macro' }
import {
  createCombinePlugin,
  type UnpluginCombineInstance,
} from 'unplugin-combine'
import { resolveJSXOptions, type JSXOptions } from './options'

const name = generatePluginName()
const plugin: UnpluginCombineInstance<JSXOptions | undefined> =
  createCombinePlugin<JSXOptions | undefined>((userOptions = {}, meta) => {
    userOptions.jsxMacros ??= true
    const options = resolveJSXOptions(userOptions)
    const framework = meta.framework!
    const plugins = [
      options.jsxDirective
        ? VueJsxDirective[framework](options.jsxDirective)
        : undefined,
      options.jsxMacros
        ? VueJsxMacros[framework](options.jsxMacros)
        : undefined,
    ].filter((plugin) => !!plugin)

    return {
      name,
      plugins,
    }
  })

export default plugin
