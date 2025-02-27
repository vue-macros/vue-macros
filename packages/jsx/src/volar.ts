import jsxDirective from '@vue-macros/volar/jsx-directive'
import jsxMacros from '@vue-macros/volar/jsx-macros'
import jsxRef from '@vue-macros/volar/jsx-ref'
import { createPlugin, type PluginReturn } from 'ts-macro'
import { resolveJSXOptions, type JSXOptions } from './options'

const jsxPlugins = {
  jsxDirective,
  jsxMacros,
  jsxRef,
}

const plugin: PluginReturn<JSXOptions | undefined> = createPlugin(
  (ctx, userOptions) => {
    const options = resolveJSXOptions(userOptions)
    return Object.entries(jsxPlugins).flatMap(([name, plugin]) => {
      const subOptions = options[name as keyof typeof options]
      if (!subOptions) return []
      return plugin(subOptions)(ctx)
    })
  },
)

export default plugin
