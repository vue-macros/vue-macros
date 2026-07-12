import { resolveOptions, type Options } from 'vue-macros'
import VueMacros from 'vue-macros/vite'
import type { AstroIntegration, ViteUserConfig } from 'astro'
import type { Plugin } from 'vite'

function findPluginAndRemove(
  name: string,
  plugins: ViteUserConfig['plugins'],
): Plugin | undefined {
  const idx = plugins!.findIndex(
    (plugin) => plugin && 'name' in plugin && plugin.name === name,
  )
  if (idx === -1) return
  const plugin = plugins![idx]
  plugins!.splice(idx, 1)
  return plugin as any
}

function plugin(options?: Options): AstroIntegration {
  return {
    name: '@vue-macros/astro',
    hooks: {
      'astro:config:setup': async ({ config }) => {
        const resolvedOptions = await resolveOptions(options || {})
        const vue = findPluginAndRemove('vite:vue', config.vite.plugins)
        const vueJsx = findPluginAndRemove('vite:vue-jsx', config.vite.plugins)

        const vueMacrosPlugins = await VueMacros({
          ...resolvedOptions,
          plugins: {
            vue,
            vueJsx,
          },
        })
        config.vite.plugins ||= []
        config.vite.plugins.push(...vueMacrosPlugins)
      },
    },
  }
}

export default plugin
