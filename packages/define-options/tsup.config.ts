import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/**/*.ts'],
  format: ['cjs', 'esm'],
  target: 'node14',
  splitting: true,
  dts: {
    compilerOptions: {
      paths: {},
    },
  },
  tsconfig: '../../tsconfig.lib.json',
  clean: true,
})
