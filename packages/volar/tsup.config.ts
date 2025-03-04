import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { transform } from 'esbuild'
import { config } from '../../tsup.config.js'

export default config({
  ignoreDeps: ['vue-tsc', 'jiti'],
  platform: 'node',
  async onSuccess(entries) {
    const files = entries.map((file) => path.basename(file, '.ts'))

    const contents = await readFile('./loader.ts')
    const transformed = await transform(contents, {
      loader: 'ts',
      format: 'cjs',
      target: 'node20',
      minifySyntax: true,
    })
    await mkdir('./dist/loader', { recursive: true })
    await Promise.all(
      files.map((file) =>
        writeFile(
          `./dist/loader/${file}.cjs`,
          transformed.code.replace('__FILE__', `../${file}.js`),
        ),
      ),
    )
  },
})
