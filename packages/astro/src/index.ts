import { type AstroIntegration } from 'astro'
import { type Options } from 'unplugin-vue-macros'
import VitePlugin from 'unplugin-vue-macros/vite'

const name = 'unplugin-vue-macros'

export default function VueMacrosAstroIntegration(
  userOptions: Options = {}
): AstroIntegration {
  return {
    name,
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vitePlugin: [VitePlugin(userOptions)],
        })
      },
    },
  }
}
