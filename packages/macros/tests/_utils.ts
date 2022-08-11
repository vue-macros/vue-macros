import { rollup } from 'rollup'
import type { Plugin } from 'rollup'

export const ToString: Plugin = {
  name: 'to-string',
  transform(code) {
    return `export default \`${code.replace(/`/g, '\\`')}\``
  },
}

export async function getCode(file: string, plugins: Plugin[]) {
  const bundle = await rollup({
    input: [file],
    external: ['vue'],
    plugins,
  })
  const output = await bundle.generate({ format: 'esm' })
  return output.output
    .map((file) => {
      if (file.type === 'chunk') {
        return file.code
      } else {
        return file.fileName
      }
    })
    .join('\n')
}
