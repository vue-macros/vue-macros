import { resolve } from 'path'
import { rollup } from 'rollup'
import glob from 'fast-glob'
import VueDefineOptions from '../src/rollup'
import type { Plugin } from 'rollup'

const ToString: Plugin = {
  name: 'to-string',
  transform(code) {
    return `export default \`${code}\``
  },
}

async function getCode(file: string, plugins: Plugin[]) {
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

describe('transform', () => {
  describe('fixtures', async () => {
    const root = resolve(__dirname, '..')
    const files = await glob('tests/fixtures/*.{vue,js,ts}', {
      cwd: root,
      onlyFiles: true,
    })

    for (const file of files) {
      it(file.replaceAll('\\', '/'), async () => {
        const filepath = resolve(root, file)

        const unpluginCode = await getCode(filepath, [
          VueDefineOptions({}),
          ToString,
        ]).catch((err) => err)
        expect(unpluginCode).toMatchSnapshot()
      })
    }
  })
})
