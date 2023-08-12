import { type AstroIntegration, type ViteUserConfig } from 'astro'
import { type Options, resolveOptions } from 'unplugin-vue-macros'
import { type Plugin } from 'vite'
import VueMacros from 'unplugin-vue-macros/vite'

export type VueMacrosOptions = Options

function findPluginAndRemove(
  name: string,
  plugins: ViteUserConfig['plugins']
): Plugin | undefined {
  const idx = plugins!.findIndex(
    (plugin) => plugin && 'name' in plugin && plugin.name === name
  )
  if (idx === -1) return
  const plugin = plugins![idx]
  plugins!.splice(idx, 1)
  return plugin as any
}

export default function (options?: VueMacrosOptions): AstroIntegration {
  return {
    name: '@vue-macros/astro',
    hooks: {
      'astro:config:setup': ({ config }) => {
        const resolvedOptions = resolveOptions(options ?? {})
        const vue = findPluginAndRemove('vite:vue', config.vite.plugins)
        const vueJsx = findPluginAndRemove('vite:vue-jsx', config.vite.plugins)

        config.vite.plugins?.push(
          VueMacros({
            ...resolvedOptions,
            plugins: {
              vue,
              vueJsx,
            },
          })
        )
      },
    },
  }
}
