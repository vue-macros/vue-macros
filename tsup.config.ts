import { defineConfig } from 'tsup'

const isDev = process.env.MODE === 'dev'

export default defineConfig({
  entry: ['./src/**/*.ts'],
  format: ['cjs', 'esm'],
  target: 'node12',
  splitting: true,
  sourcemap: true,
  dts: !isDev,
  watch: isDev,
})
