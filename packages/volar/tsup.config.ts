import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/*.ts', '!./src/*.d.ts', '!./src/common.ts'],
  format: ['cjs'],
  target: 'node14',
  splitting: false,
  dts: false,
  clean: true,
  esbuildPlugins: [
    {
      name: 'rewrite-export-default',
      setup(build) {
        build.onLoad({ filter: /\.ts$/ }, async ({ path }) => {
          if (!path.startsWith(resolve(__dirname, 'src'))) return

          const contents = readFile(path, 'utf8')
          return {
            contents: (await contents).replace('export default', 'export ='),
            loader: 'ts',
          }
        })
      },
    },
  ],
})
