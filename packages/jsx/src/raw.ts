import jsxDirective from '@vue-macros/jsx-directive/raw'
import jsxMacros from '@vue-macros/jsx-macros/raw'

import { resolveJSXOptions, type JSXOptions } from './options'
import type { UnpluginFactory } from 'unplugin'

export { defineConfig, resolveOptions, type Options } from '@vue-macros/config'

const plugin: UnpluginFactory<JSXOptions | undefined, true> = (
  userOptions = {},
  meta,
) => {
  const options = resolveJSXOptions(userOptions)

  return [
    options.directive ? jsxDirective(options.directive, meta) : undefined,
    options.macros ? jsxMacros(options.macros, meta) : undefined,
  ]
    .flatMap((plugin) => plugin)
    .filter((plugin) => !!plugin)
}

export default plugin
