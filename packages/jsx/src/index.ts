import { resolveOptions, type Options } from '@vue-macros/config'
import VueJsxDirective from '@vue-macros/jsx-directive'

import {
  createCombinePlugin,
  type UnpluginCombineInstance,
} from 'unplugin-combine'
import { generatePluginName } from '#macros' with { type: 'macro' }

export { defineConfig, resolveOptions, type Options } from '@vue-macros/config'

export type JSXOptions = Pick<Options, 'jsxDirective' | 'jsxMacros' | 'jsxRef'>

const name = generatePluginName()
const plugin: UnpluginCombineInstance<JSXOptions | undefined> =
  createCombinePlugin<JSXOptions | undefined>((userOptions = {}, meta) => {
    const options = resolveOptions(userOptions)

    const framework = meta.framework!

    const plugins = [
      options.jsxDirective
        ? VueJsxDirective[framework](options.jsxDirective)
        : undefined,
    ].filter((plugin) => !!plugin)

    return {
      name,
      plugins,
    }
  })

export default plugin
