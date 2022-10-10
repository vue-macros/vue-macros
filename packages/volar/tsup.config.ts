import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/*.ts'],
  format: ['cjs'],
  target: 'node14',
  splitting: true,
  dts: false,
  clean: true,
})
