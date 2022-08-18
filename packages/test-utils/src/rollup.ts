import { rollup } from 'rollup'
import type { Plugin } from 'rollup'

export const ToStringPlugin = (): Plugin => {
  return {
    name: 'to-string',
    transform: (code) => `export default \`${code.replace(/`/g, '\\`')}\``,
  }
}

export const RemoveVueFilePathPlugin = (): Plugin => {
  const REGEX = /\[["']__file["'],\s*["'](.*?)["']]/g
  return {
    name: 'remove-vue-filepath',
    transform(code: string) {
      const transformed = code.replace(REGEX, '__FILE__')
      if (code !== transformed) return transformed
    },
  }
}

export async function rollupBuild(file: string, plugins: Plugin[]) {
  const bundle = await rollup({
    input: [file],
    external: ['vue'],
    plugins,
  })
  const output = await bundle.generate({
    format: 'esm',
    sourcemap: false,
  })
  return output.output
    .map((file) => (file.type === 'chunk' ? file.code : file.fileName))
    .join('\n')
}
