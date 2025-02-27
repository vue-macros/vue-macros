import type { FilterOptions } from '@vue-macros/common'
import type { Options as OptionsJsxDirective } from '@vue-macros/jsx-directive'
import type { Options as OptionsJsxMacros } from '@vue-macros/jsx-macros'

export type JSXOptions = {
  lib?: 'vue' | 'vue/vapor' | 'react' | 'preact' | 'solid' | (string & {})
  jsxRef?: ResolvedJSXOptions['jsxRef'] | boolean
  jsxMacros?: ResolvedJSXOptions['jsxMacros'] | boolean
  jsxDirective?: ResolvedJSXOptions['jsxDirective'] | boolean
}

export type ResolvedJSXOptions = {
  jsxRef?: FilterOptions & { alias?: string[] }
  jsxMacros?: OptionsJsxMacros
  jsxDirective?: OptionsJsxDirective
}

export function resolveJSXOptions(
  options: JSXOptions = {},
): ResolvedJSXOptions {
  const resolveOptions: ResolvedJSXOptions = {}
  if (options.jsxDirective !== false)
    resolveOptions.jsxDirective =
      options.jsxDirective === true ? {} : (resolveOptions.jsxDirective ?? {})
  if (options.jsxMacros !== false)
    resolveOptions.jsxMacros =
      options.jsxMacros === true ? {} : (resolveOptions.jsxMacros ?? {})
  if (options.jsxRef !== false)
    resolveOptions.jsxRef =
      options.jsxRef === true ? {} : (resolveOptions.jsxRef ?? {})

  if (options.lib) {
    resolveOptions.jsxDirective &&
      (resolveOptions.jsxDirective.lib ??= options.lib)
    resolveOptions.jsxMacros && (resolveOptions.jsxMacros.lib ??= options.lib)
  }
  return resolveOptions
}
