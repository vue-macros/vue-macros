import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/**/*.ts'],
  format: ['cjs', 'esm'],
  target: 'node12',
  splitting: true,
  sourcemap: true,
  dts: true,
})
