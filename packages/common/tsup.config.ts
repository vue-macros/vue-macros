import { readFile } from 'node:fs/promises'
import { defineConfig } from 'tsup'

const rawRE = /[&?]raw(?:&|$)/

export default defineConfig({
  entry: ['./src/*.ts'],
  format: ['cjs', 'esm'],
  target: 'node14',
  splitting: true,
  watch: !!process.env.DEV,
  dts: process.env.DEV
    ? false
    : {
        compilerOptions: {
          paths: {},
          composite: false,
        },
      },
  tsconfig: '../../tsconfig.lib.json',
  clean: true,
  esbuildPlugins: [
    {
      name: 'raw-plugin',
      setup(build) {
        build.onLoad({ filter: /.*/ }, async ({ path, suffix }) => {
          if (!rawRE.test(suffix)) return
          // raw query, read file and return as string
          return {
            contents: `export default ${JSON.stringify(
              await readFile(path, 'utf-8')
            )}`,
          }
        })
      },
    },
  ],
})
