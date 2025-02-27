import { resolveOptions, type Options } from '@vue-macros/config'
import VueJsxDirective from '@vue-macros/jsx-directive'
import VueJsxMacros from '@vue-macros/jsx-macros'

import { generatePluginName } from '#macros' with { type: 'macro' }
import {
  createCombinePlugin,
  type UnpluginCombineInstance,
} from 'unplugin-combine'

export { defineConfig, resolveOptions, type Options } from '@vue-macros/config'

export type JSXOptions = {
  lib?: 'vue' | 'vue/vapor' | 'react' | 'preact' | 'solid' | (string & {})
} & Pick<Options, 'jsxDirective' | 'jsxMacros' | 'jsxRef'>

const name = generatePluginName()
const plugin: UnpluginCombineInstance<JSXOptions | undefined> =
  createCombinePlugin<JSXOptions | undefined>((userOptions = {}, meta) => {
    userOptions.jsxMacros ??= true
    userOptions.lib ??= 'vue'
    const options = resolveOptions(userOptions)
    if (userOptions.lib) {
      options.jsxDirective && (options.jsxDirective.lib ??= userOptions.lib)
      options.jsxMacros && (options.jsxMacros.lib ??= userOptions.lib)
    }

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
