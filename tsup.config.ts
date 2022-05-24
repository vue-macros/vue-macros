import { defineConfig } from 'tsup'

const isDev = process.env.MODE === 'dev'

export default defineConfig({
  entry: ['./src/**/*.ts'],
  format: ['cjs', 'esm'],
  target: 'node14',
  splitting: true,
  dts: !isDev,
  watch: isDev,
})
