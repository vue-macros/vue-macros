// From https://github.com/vite-pwa/vitepress/blob/main/src/index.ts

import { type UserConfig, defineConfigWithTheme } from 'vitepress'
import { VitePWA, type VitePluginPWAAPI } from 'vite-plugin-pwa'
import { configurePWAOptions } from './config'

export function withPwa(config: UserConfig) {
  let viteConf = config.vite
  if (!viteConf) {
    viteConf = {}
    config.vite = viteConf
  }

  let vitePlugins = viteConf.plugins
  if (typeof vitePlugins === 'undefined') {
    vitePlugins = []
    viteConf.plugins = vitePlugins
  }

  if (vitePlugins && vitePlugins.length > 0) {
    const pwaPlugin = vitePlugins.find(
      (i) =>
        i &&
        typeof i === 'object' &&
        'name' in i &&
        i.name === 'vite-plugin-pwa'
    )
    if (pwaPlugin)
      throw new Error(
        'Remove vite-plugin-pwa plugin from Vite Plugins entry in VitePress config file'
      )
  }

  const { pwa = {}, ...vitePressOptions } = config

  configurePWAOptions(pwa)

  let api: VitePluginPWAAPI | undefined

  vitePlugins.push(VitePWA({ ...pwa }), {
    name: 'vite-plugin-pwa:vitepress',
    apply: 'build',
    enforce: 'post',
    configResolved(resolvedViteconfig) {
      if (!resolvedViteconfig.build.ssr)
        api = resolvedViteconfig.plugins.find(
          (p) => p.name === 'vite-plugin-pwa'
        )?.api
    },
  })

  const vitePressConfig = defineConfigWithTheme(vitePressOptions)

  const userTransformHead = vitePressConfig.transformHead
  const userBuildEnd = vitePressConfig.buildEnd

  vitePressConfig.transformHead = async (ctx) => {
    const head = (await userTransformHead?.(ctx)) ?? []

    const webManifestData = api?.webManifestData()
    if (webManifestData) {
      const href = webManifestData.href
      if (webManifestData.useCredentials)
        head.push([
          'link',
          { rel: 'manifest', href, crossorigin: 'use-credentials' },
        ])
      else head.push(['link', { rel: 'manifest', href }])
    }

    const registerSWData = api?.registerSWData()
    if (registerSWData && registerSWData.shouldRegisterSW) {
      if (registerSWData.inline) {
        head.push([
          'script',
          { id: 'vite-plugin-pwa:inline-sw' },
          `if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('${registerSWData.inlinePath}', { scope: '${registerSWData.scope}' })})}`,
        ])
      } else {
        head.push([
          'script',
          {
            id: 'vite-plugin-pwa:register-sw',
            src: registerSWData.registerPath,
          },
        ])
      }
    }

    return head
  }

  vitePressConfig.buildEnd = async (siteConfig) => {
    await userBuildEnd?.(siteConfig)
    api && !api.disabled && (await api.generateSW())
  }

  return vitePressConfig
}

export * from './types'
