import { type AstroIntegration, type ViteUserConfig } from 'astro'
import { type Options, resolveOptions } from 'unplugin-vue-macros'
import { type Plugin } from 'vite'
import VueMacros from 'unplugin-vue-macros/vite'
import { type Options as ViteVueOptions } from '@vitejs/plugin-vue'
import {
  type Options as OptionsShortVmodel,
  transformShortVmodel,
} from '@vue-macros/short-vmodel'
import { transformBooleanProp } from '@vue-macros/boolean-prop'

export type VueMacrosOptions = Options & {
  booleanProp?: {} | false
  shortVmodel?: OptionsShortVmodel | false
}

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

        const viteVue = vue!.config! as ViteVueOptions

        if (options?.shortVmodel !== false || options.booleanProp) {
          viteVue.template ||= {}
          viteVue.template.compilerOptions ||= {}
          viteVue.template.compilerOptions.nodeTransforms ||= []
          const { nodeTransforms } = viteVue.template.compilerOptions

          if (options?.shortVmodel !== false) {
            nodeTransforms.push(transformShortVmodel(options?.shortVmodel))
          }
          if (options?.booleanProp) nodeTransforms.push(transformBooleanProp())
        }

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
