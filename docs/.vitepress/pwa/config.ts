// From https://github.com/vite-pwa/vitepress/blob/main/src/config.ts

import type { VitePWAOptions } from 'vite-plugin-pwa'

export function configurePWAOptions(options: Partial<VitePWAOptions>) {
  if (!options.outDir) options.outDir = '.vitepress/dist'

  if (options.strategies === 'injectManifest') {
    options.injectManifest = options.injectManifest ?? {}
  } else {
    options.workbox = options.workbox ?? {}
    if (
      options.registerType === 'autoUpdate' &&
      (options.injectRegister === 'script' ||
        options.injectRegister === 'inline')
    ) {
      options.workbox.clientsClaim = true
      options.workbox.skipWaiting = true
    }
  }
}
