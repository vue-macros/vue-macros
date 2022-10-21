// From https://github.com/vite-pwa/vitepress/blob/main/src/types.ts

import type { VitePWAOptions } from 'vite-plugin-pwa'

export type PwaOptions = Partial<VitePWAOptions>

declare module 'vitepress' {
  interface UserConfig {
    pwa?: PwaOptions
  }
}
