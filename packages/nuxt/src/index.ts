import { defineNuxtModule, useNuxt } from '@nuxt/kit'
import { REGEX_SETUP_SFC } from '@vue-macros/common'
import { resolveOptions, type Options } from 'vue-macros'
import VueMacros from 'vue-macros/vite'
import { githubRepo } from '../../../macros' with { type: 'macro' }
import type {} from '@nuxt/devtools'
import type { NuxtModule, ViteConfig } from '@nuxt/schema'
import type { Plugin } from 'vite'

const module: NuxtModule<Options> = defineNuxtModule<Options>({
  meta: {
    name: 'vue-macros',
    configKey: 'macros',
  },
  defaults: {},
  async setup(options) {
    const nuxt = useNuxt()
    const resolvedOptions = await resolveOptions(options)

    nuxt.options.typescript.tsConfig ||= {}
    const vueCompilerOptions =
      (nuxt.options.typescript.tsConfig.vueCompilerOptions ||= {})
    vueCompilerOptions.plugins ||= []
    vueCompilerOptions.plugins.push('@vue-macros/nuxt/volar')

    nuxt.hook(
      'vite:configResolved',
      async (config: ViteConfig, { isClient }) => {
        function findPluginAndRemove(
          name: string,
        ): [plugin: Plugin | null, index: number] {
          const idx = config.plugins!.findIndex(
            (plugin) => plugin && 'name' in plugin && plugin.name === name,
          )
          if (idx === -1) return [null, idx]
          const plugin = config.plugins![idx]
          config.plugins!.splice(idx, 1)
          return [plugin as any, idx]
        }
        config.plugins ||= []
        const [vue, idx] = findPluginAndRemove('vite:vue')
        const [vueJsx] = findPluginAndRemove('vite:vue-jsx')

        const vueMacrosPlugins = await VueMacros({
          ...resolvedOptions,
          plugins: { vue, vueJsx },
          nuxtContext: { isClient },
        })
        if (idx !== -1) {
          config.plugins.splice(idx, 0, ...vueMacrosPlugins)
        } else {
          config.plugins.push(...vueMacrosPlugins)
        }
      },
    )

    nuxt.hook('prepare:types', (opts) => {
      opts.references.push({ types: 'vue-macros/macros-global' })
    })

    nuxt.hook('devtools:customTabs', (tabs) => {
      tabs.push({
        name: 'vue-macros',
        title: 'Vue Macros',
        icon: `https://raw.githubusercontent.com/${githubRepo}/main/docs/public/favicon.svg`,
        view: {
          type: 'iframe',
          src: '/__vue-macros',
        },
      })
    })

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
        }),
      )
    })
  },
})
export default module

declare module '@nuxt/schema' {
  interface NuxtConfig {
    macros?: Options
  }
  interface NuxtOptions {
    macros?: Options
  }
}
