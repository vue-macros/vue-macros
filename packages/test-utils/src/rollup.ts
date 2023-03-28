import { rollup } from 'rollup'
import { default as ViteVueJsx } from '@vitejs/plugin-vue-jsx'
import type { Options as VueJsxOptions } from '@vitejs/plugin-vue-jsx'
import type { InputPluginOption, Plugin } from 'rollup'

export { default as RollupEsbuildPlugin } from 'rollup-plugin-esbuild'
export { default as RollupVue } from 'unplugin-vue/rollup'
export { default as RollupVue2 } from '@vitejs/plugin-vue2'
export const RollupVueJsx = ViteVueJsx as (options?: VueJsxOptions) => Plugin

export const RollupToStringPlugin = (): Plugin => {
  return {
    name: 'to-string',
    transform: (code) => `export default \`${code.replace(/`/g, '\\`')}\``,
  }
}

export const RollupRemoveVueFilePathPlugin = (): Plugin => {
  const REGEX = [
    /\[["']__file["'],\s*["'](.*?)["']]/g,
    /__component__\.options\.__file.*/,
  ]
  return {
    name: 'remove-vue-filepath',
    transform(code: string) {
      const transformed = code
        .replace(REGEX[0], '__FILE__')
        .replace(REGEX[1], '__FILE__')
      if (code !== transformed) return transformed
    },
  }
}

export const RollupEscapeNullCharacterPlugin = (): Plugin => {
  return {
    name: 'escape-null-character',
    generateBundle(options, bundle) {
      for (const filename of Object.keys(bundle)) {
        const b = bundle[filename]
        if (b.type !== 'chunk') continue
        if (b.code.includes('\0')) {
          b.code = b.code.replace(/\0/g, '[NULL]')
        }
      }
    },
  }
}

export async function rollupBuild(file: string, plugins: InputPluginOption) {
  const bundle = await rollup({
    input: [file],
    external: [
      'vue',
      '@vueuse/core',
      '/plugin-vue/export-helper',
      '\0plugin-vue2:normalizer',
      /^\/vue-macros\/.*/,
    ],
    plugins,
    treeshake: false,
    onwarn(warning, defaultHandler) {
      if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
      defaultHandler(warning)
    },
  })
  const output = await bundle.generate({
    format: 'esm',
    sourcemap: false,
  })
  return output.output
    .map((file) => (file.type === 'chunk' ? file.code : file.fileName))
    .join('\n')
}
