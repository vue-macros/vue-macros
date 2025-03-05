import { resolveJSXOptions, type JSXOptions } from '@vue-macros/jsx/options'
import { createPlugin, type PluginReturn } from 'ts-macro'
import jsxDirective from './jsx-directive'
import jsxMacros from './jsx-macros'
import jsxRef from './jsx-ref'

const jsxPlugins = [
  ['directive', jsxDirective],
  ['macros', jsxMacros],
  ['ref', jsxRef],
] as const

const plugin: PluginReturn<JSXOptions | undefined> = createPlugin(
  (ctx, userOptions) => {
    const options = resolveJSXOptions(userOptions)
    return jsxPlugins.flatMap(([name, plugin]) =>
      options[name] ? plugin(options[name])(ctx) : [],
    )
  },
)

export default plugin
export { plugin as 'module.exports' }
