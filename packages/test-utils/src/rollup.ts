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

export async function rollupBuild(file: string, plugins: InputPluginOption) {
  const bundle = await rollup({
    input: [file],
    external: ['vue', '@vueuse/core', '\0plugin-vue2:normalizer'],
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
