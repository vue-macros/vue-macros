import { defineNuxtModule, useNuxt } from '@nuxt/kit'
import VueMacros from 'unplugin-vue-macros/vite'
import { transformShortVmodel } from '@vue-macros/short-vmodel'
import { type Options, resolveOptions } from 'unplugin-vue-macros'
import { type Options as OptionsShortVmodel } from '@vue-macros/short-vmodel'
import { type Plugin } from 'vite'
import {} from '@nuxt/devtools'

export type VueMacrosOptions = Options & {
  shortVmodel?: OptionsShortVmodel | false
}

export default defineNuxtModule<VueMacrosOptions>({
  meta: {
    name: 'unplugin-vue-macros',
    configKey: 'macros',
  },
  defaults: {},
  setup(options) {
    const nuxt = useNuxt()
    const resolvedOptions = resolveOptions(options)

    nuxt.hook('vite:extendConfig', (config, { isClient }) => {
      function findPluginAndRemove(name: string): Plugin | undefined {
        const idx = config.plugins!.findIndex(
          (plugin) => plugin && 'name' in plugin && plugin.name === name
        )
        if (idx === -1) return
        const plugin = config.plugins![idx]
        config.plugins!.splice(idx, 1)
        return plugin as any
      }
      config.plugins ||= []
      const vue = findPluginAndRemove('vite:vue')
      const vueJsx = findPluginAndRemove('vite:vue-jsx')

      config.plugins.push(
        VueMacros({
          ...resolvedOptions,
          plugins: { vue, vueJsx },
          nuxtContext: { isClient },
        })
      )
    })

    nuxt.hook('prepare:types', (opts) => {
      opts.references.push({ types: 'unplugin-vue-macros/macros-global' })
    })

    nuxt.hook('devtools:customTabs', (tabs) => {
      tabs.push({
        name: 'vue-macros',
        title: 'Vue Macros',
        icon: 'https://raw.githubusercontent.com/sxzz/unplugin-vue-macros/main/docs/public/favicon.svg',
        view: {
          type: 'iframe',
          src: '/__vue-macros',
        },
      })
    })

    nuxt.options.typescript.tsConfig ||= {}

    nuxt.options.typescript.tsConfig.vueCompilerOptions ||= {}
    const vueCompilerOptions =
      nuxt.options.typescript.tsConfig.vueCompilerOptions

    vueCompilerOptions.plugins ||= []
    const volarPlugins = vueCompilerOptions.plugins

    if (resolvedOptions.defineOptions)
      volarPlugins.push('@vue-macros/volar/define-options')

    if (resolvedOptions.defineSlots)
      volarPlugins.push('@vue-macros/volar/define-slots')

    if (resolvedOptions.defineModels)
      volarPlugins.push('@vue-macros/volar/define-models')

    if (resolvedOptions.defineProps)
      volarPlugins.push('@vue-macros/volar/define-props')

    if (resolvedOptions.definePropsRefs)
      volarPlugins.push('@vue-macros/volar/define-props-refs')

    if (resolvedOptions.exportProps)
      volarPlugins.push('@vue-macros/volar/export-props')

    if (resolvedOptions.defineProp)
      vueCompilerOptions.experimentalDefinePropProposal =
        resolvedOptions.defineProp.edition || 'kevinEdition'

    nuxt.options.vite.vue ||= {}
    nuxt.options.vite.vue.include ||= [/\.vue$/]
    if (!Array.isArray(nuxt.options.vite.vue.include))
      nuxt.options.vite.vue.include = [nuxt.options.vite.vue.include]
    nuxt.options.vite.vue.include.push(/\.setup\.[cm]?[jt]sx?$/)

    if (options.shortVmodel !== false) {
      volarPlugins.push('@vue-macros/volar/short-vmodel')

      if (options.shortVmodel)
        vueCompilerOptions.shortVmodel = {
          prefix: options.shortVmodel.prefix,
        }

      nuxt.options.vite.vue.template ||= {}
      nuxt.options.vite.vue.template.compilerOptions ||= {}
      nuxt.options.vite.vue.template.compilerOptions.nodeTransforms ||= []
      nuxt.options.vite.vue.template.compilerOptions.nodeTransforms.push(
        transformShortVmodel(options.shortVmodel)
      )
    }
  },
})

declare module '@nuxt/schema' {
  interface NuxtConfig {
    macros?: Options
  }
  interface NuxtOptions {
    macros?: Options
  }
}
