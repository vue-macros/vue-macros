import { defineNuxtModule, useNuxt } from '@nuxt/kit'
import VueMacros from 'unplugin-vue-macros/vite'
import { type Options, resolveOptions } from 'unplugin-vue-macros'
import { type Plugin } from 'vite'
import type {} from '@nuxt/devtools'
import { type VolarOptions } from '@vue-macros/volar'
import { REGEX_SETUP_SFC } from '@vue-macros/common'

export type VueMacrosOptions = Options

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
        icon: 'https://raw.githubusercontent.com/vue-macros/vue-macros/main/docs/public/favicon.svg',
        view: {
          type: 'iframe',
          src: '/__vue-macros',
        },
      })
    })

    nuxt.options.typescript.tsConfig ||= {}

    // @ts-expect-error https://github.com/unjs/pkg-types/pull/130
    nuxt.options.typescript.tsConfig.vueCompilerOptions ||= {}
    const vueCompilerOptions =
      // @ts-expect-error
      nuxt.options.typescript.tsConfig.vueCompilerOptions

    vueCompilerOptions.vueMacros ||= {}
    const volarOptions = vueCompilerOptions.vueMacros as VolarOptions

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

    if (resolvedOptions.jsxDirective)
      volarPlugins.push('@vue-macros/volar/jsx-directive')

    if (resolvedOptions.defineProp)
      vueCompilerOptions.experimentalDefinePropProposal =
        resolvedOptions.defineProp.edition || 'kevinEdition'

    if (resolvedOptions.shortVmodel) {
      volarPlugins.push('@vue-macros/volar/short-vmodel')
      volarOptions.shortVmodel = {
        prefix: resolvedOptions.shortVmodel.prefix,
      }
    }

    const viteVue = (nuxt.options.vite.vue ||= {})

    if (resolvedOptions.setupSFC) {
      viteVue.include ||= [/\.vue$/]
      if (!Array.isArray(viteVue.include)) viteVue.include = [viteVue.include]
      viteVue.include.push(REGEX_SETUP_SFC)

      nuxt.hook('components:extend', (components) => {
        for (const component of components) {
          component.pascalName = component.pascalName.replace(/Setup$/, '')
          component.kebabName = component.kebabName.replace(/-setup$/, '')
        }
      })

      nuxt.hook('pages:extend', (pages) => {
        for (const page of pages) {
          if (!page.file || !REGEX_SETUP_SFC.test(page.file)) continue

          if (page.name) page.name = page.name.replace(/\.setup$/, '')
          if (page.path)
            page.path = page.path
              .replace(/\/index\.setup$/, '/')
              .replace(/\.setup$/, '')
        }
      })
    }

    nuxt.hook('app:resolve', (app) => {
      app.layouts = Object.fromEntries(
        Object.entries(app.layouts).map(([key, value]) => {
          if (key.endsWith('-setup')) {
            key = key.replace(/-setup$/, '')
            value.name = value.name.replace(/-setup$/, '')
          }
          return [key, value]
        })
      )
    })
  },
})

declare module '@nuxt/schema' {
  interface NuxtConfig {
    macros?: VueMacrosOptions
  }
  interface NuxtOptions {
    macros?: VueMacrosOptions
  }
}
