import { type InputPluginOption, type Plugin, rollup } from 'rollup'
import {
  default as ViteVueJsx,
  type Options as VueJsxOptions,
} from '@vitejs/plugin-vue-jsx'

export { default as RollupEsbuildPlugin } from 'rollup-plugin-esbuild'
export { default as RollupVue } from 'unplugin-vue/rollup'
export { default as RollupVue2 } from '@vitejs/plugin-vue2'
export const RollupVueJsx = ViteVueJsx as (options?: VueJsxOptions) => Plugin

export { default as RollupJson } from '@rollup/plugin-json'
export { nodeResolve as RollupNodeResolve } from '@rollup/plugin-node-resolve'

export const RollupToStringPlugin = (): Plugin => {
  return {
    name: 'to-string',
    transform: (code) => `export default \`${code.replaceAll('`', '\\`')}\``,
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
        .replaceAll(REGEX[0], '__FILE__')
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
          b.code = b.code.replaceAll('\0', '[NULL]')
        }
      }
    },
  }
}

export async function rollupBuild(file: string, plugins: InputPluginOption) {
  const bundle = await rollup({
    input: [file],
    external: ['vue', '@vueuse/core', /^\0.*/, /^\/vue-macros\/.*/],
    plugins: [
      plugins,
      RollupEscapeNullCharacterPlugin(),
      RollupRemoveVueFilePathPlugin(),
    ],
    treeshake: false,
    onwarn(warning, defaultHandler) {
      if (
        ['UNUSED_EXTERNAL_IMPORT', 'UNRESOLVED_IMPORT'].includes(warning.code!)
      )
        return
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
